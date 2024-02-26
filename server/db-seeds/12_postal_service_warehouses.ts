import { Knex } from 'knex';
import { getNovaPoshtaWarehousesByCityViaAPI } from '../src/models/shipping.js';
import sleep from '../src/util/sleep.js';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('postal_service_warehouses').del();

    const availableCities = await knex('cities').select<{ name: string }[]>([
        'name',
    ]);

    const getPostalServiceIdSubquery = (
        postalService: 'Нова Пошта' | 'Укрпошта'
    ) => {
        return knex('postal_services')
            .select('id')
            .where('name', '=', postalService);
    };

    const getCityIdSubquery = (cityName: string) => {
        return knex('cities').select('id').where('name', '=', cityName);
    };

    for (let { name: cityName } of availableCities) {
        console.log(
            `Retrieving Nova Poshta warehouses for ${cityName}: `,
            new Date().toISOString()
        );
        // sleeping for 1s so that we don't exceed the rate limit of the Nova Poshta API
        await sleep(1000);
        const warehousesDescriptions =
            await getNovaPoshtaWarehousesByCityViaAPI(cityName);

        await knex('postal_service_warehouses').insert(
            warehousesDescriptions.map((warehouseDescription) => ({
                postal_service_id: getPostalServiceIdSubquery('Нова Пошта'),
                city_id: getCityIdSubquery(cityName),
                warehouse_description: warehouseDescription,
            }))
        );
    }
}
