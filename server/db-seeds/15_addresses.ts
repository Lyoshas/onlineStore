import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('addresses').del();

    const addresses = [
        {
            id: 1,
            street_name: 'Хрещатик',
            building_number: '25А',
            postal_code: '01001',
        },
        {
            id: 2,
            street_name: 'Дегтярівська',
            building_number: '32',
            postal_code: '02002',
        },
        {
            id: 3,
            street_name: 'Героїв Незалежності',
            building_number: '16',
            postal_code: '03003',
        },
        {
            id: 4,
            street_name: 'Львівська',
            building_number: '7',
            postal_code: '04004',
        },
        {
            id: 5,
            street_name: 'Саксаганського',
            building_number: '1/36',
            postal_code: '05005',
        },
    ];

    await knex.raw(
        `
            SELECT setval(
                pg_get_serial_sequence('addresses', 'id'),
                (SELECT MAX(id) FROM addresses) + 1
            );
        `
    );

    // Inserts seed entries
    await knex('addresses').insert(
        addresses.map((address) => ({
            ...address,
            city_id: knex('cities')
                .select('id')
                .orderByRaw('RANDOM()')
                .limit(1),
        }))
    );
}
