import { Knex } from 'knex';
import { getNovaPoshtaWarehousesByCityViaAPI } from '../src/models/shipping.js';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('postal_service_warehouses').del();

    const availableCities = await knex('cities').select<{ name: string }[]>([
        'name',
    ]);

    const getDeliveryMethodIdSubquery = (
        deliveryMethod: 'Нова Пошта' | 'Укрпошта'
    ) => {
        return knex('delivery_methods')
            .select('id')
            .where('name', '=', deliveryMethod);
    };

    const getCityIdSubquery = (cityName: string) => {
        return knex('cities').select('id').where('name', '=', cityName);
    };

    for (let { name: cityName } of availableCities) {
        const warehousesDescription = await getNovaPoshtaWarehousesByCityViaAPI(
            cityName
        );

        await knex('postal_service_warehouses').insert(
            warehousesDescription.map((warehouseDescription) => ({
                postal_service_id: getDeliveryMethodIdSubquery('Нова Пошта'),
                city_id: getCityIdSubquery(cityName),
                warehouse_description: warehouseDescription,
            }))
        );
    }
}
