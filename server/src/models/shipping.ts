import axios from 'axios';
import QueryStream from 'pg-query-stream';
import streamChain from 'stream-chain';
// these weird imports are necessary because 'stream-json' is a CommonJS module
import streamJson from 'stream-json';
import streamJsonPick from 'stream-json/filters/Pick.js';
import streamJsonStreamArray from 'stream-json/streamers/StreamArray.js';

import dbPool from '../services/postgres.service.js';
import formatSqlQuery from '../util/formatSqlQuery.js';

// retrieves Nova Poshta warehouses from the NovaPoshta API
// use this function only when absolutely necessary,
// because it takes a long time to load all warehouses of a major city
// in most cases, it's better to default to using "getNovaPoshtaWarehousesByCityViaDB()"
export const getNovaPoshtaWarehousesByCityViaAPI = async (
    cityName: string
): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const warehouses: string[] = [];

        axios
            .post(
                'https://api.novaposhta.ua/v2.0/json/',
                {
                    apiKey: process.env.NOVA_POSHTA_API_KEY!,
                    modelName: 'Address',
                    calledMethod: 'getWarehouses',
                    methodProperties: {
                        CityName: cityName,
                        Language: 'UA',
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    responseType: 'stream',
                }
            )
            .then((response) => {
                // "response.data" is a readable stream, so here we're creating a pipeline
                // that will parse the incoming JSON and extract relevant Nova Poshta warehouses
                // this way, the RAM consumption will be minimal, because there's no need to
                // load the big API response into RAM
                const pipeline = streamChain.chain([
                    response.data,
                    streamJson.parser(),
                    streamJsonPick.pick({ filter: 'data' }),
                    streamJsonStreamArray.streamArray(),
                    (data) => {
                        const warehouseDescription = data.value.Description;

                        return warehouseDescription.startsWith(
                            'Відділення №'
                        ) || warehouseDescription.startsWith('Пункт №')
                            ? warehouseDescription.replace(
                                  'Пункт № ',
                                  'Пункт №'
                              )
                            : null;
                    },
                ]);

                pipeline.on('data', (warehouseDescription: string) => {
                    warehouses.push(warehouseDescription);
                });
                pipeline.on('end', () => resolve(warehouses));
                pipeline.on('error', (err) => reject(err));
            });
    });
};

// retrieves Nova Poshta warehouses from the DB as a readable stream
// it doesn't load everything into memory, because the dataset may be too large
export const getNovaPoshtaWarehousesByCityViaDB = async (cityName: string) => {
    const query = new QueryStream(
        formatSqlQuery(`
            SELECT warehouse_description
            FROM postal_service_warehouses AS p_s_w
            INNER JOIN cities ON cities.id = p_s_w.city_id 
            WHERE cities.name = $1
        `),
        [cityName]
    );
    const dbClient = await dbPool.connect();
    const dbStream = dbClient.query(query);

    return { dbStream, dbClient };
};

export const doesCityExist = async (city: string): Promise<boolean> => {
    const { rows } = await dbPool.query<{ exists: boolean }>(
        'SELECT EXISTS(SELECT 1 FROM cities WHERE name = $1)',
        [city]
    );
    return rows[0].exists;
};

export const getSupportedCities = async (): Promise<string[]> => {
    const { rows } = await dbPool.query<{ city_name: string }>(
        'SELECT name AS city_name FROM cities'
    );
    return rows.map((row) => row.city_name);
};

export const doesPostalServiceWarehouseExist = async (
    cityName: string,
    warehouseDescription: string
): Promise<boolean> => {
    const { rows } = await dbPool.query<{ exists: boolean }>(
        `SELECT EXISTS(
            SELECT 1
            FROM postal_service_warehouses
            WHERE city_id = (
                SELECT id FROM cities WHERE name = $1
            ) AND warehouse_description = $2
        )`,
        [cityName, warehouseDescription]
    );

    return rows[0].exists;
};
