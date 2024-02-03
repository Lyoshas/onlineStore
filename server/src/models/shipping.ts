import axios from 'axios';
import QueryStream from 'pg-query-stream';

import GetNovaPoshtaWarehousesResponse from '../interfaces/GetNovaPoshtaWarehousesResponse.js';
import dbPool from '../services/postgres.service.js';
import formatSqlQuery from '../util/formatSqlQuery.js';

const getLimitedWarehousesByCity = (cityName: string, page: number) => {
    return axios
        .post<GetNovaPoshtaWarehousesResponse>(
            'https://api.novaposhta.ua/v2.0/json/',
            {
                apiKey: process.env.NOVA_POSHTA_API_KEY!,
                modelName: 'Address',
                calledMethod: 'getWarehouses',
                methodProperties: {
                    CityName: cityName,
                    Page: page,
                    Limit: 500,
                    Language: 'UA',
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
        .then((result) => result.data);
};

// retrieves Nova Poshta warehouses from the NovaPoshta API
// use this function only when absolutely necessary,
// because it can take up to 15s to retrieve all warehouses in a major city
// in most cases, it's better to default to using "getNovaPoshtaWarehousesByCityViaDB()"
export const getNovaPoshtaWarehousesByCityViaAPI = async (
    cityName: string
): Promise<string[]> => {
    const warehouses: string[] = [];

    let currentPage = 1;
    let currentResult = await getLimitedWarehousesByCity(cityName, currentPage);
    while (currentResult.data.length > 0) {
        currentResult.data.forEach((warehouseData) => {
            if (
                warehouseData.Description.startsWith('Відділення №') ||
                warehouseData.Description.startsWith('Пункт №')
            ) {
                warehouses.push(
                    warehouseData.Description.replace('Пункт № ', 'Пункт №')
                );
            }
        });

        currentResult = await getLimitedWarehousesByCity(
            cityName,
            ++currentPage
        );
    }

    return warehouses;
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
