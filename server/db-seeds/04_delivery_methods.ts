import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('delivery_methods').del();

    // Inserts seed entries
    await knex('delivery_methods').insert([
        { name: 'Нова Пошта' },
        { name: 'Укрпошта' },
    ]);
}
