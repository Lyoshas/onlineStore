import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('postal_services').del();

    // Inserts seed entries
    await knex('postal_services').insert([
        { name: 'Нова Пошта' },
        { name: 'Укрпошта' },
    ]);
}
