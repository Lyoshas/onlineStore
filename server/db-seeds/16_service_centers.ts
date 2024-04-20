import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('service_centers').del();

    // Inserts seed entries
    await knex('service_centers').insert([
        {
            id: 1,
            address_id: 1,
        },
        {
            id: 2,
            address_id: 2,
        },
        {
            id: 3,
            address_id: 3,
        },
        {
            id: 4,
            address_id: 4,
        },
        {
            id: 5,
            address_id: 5,
        },
    ]);
}
