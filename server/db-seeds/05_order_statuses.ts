import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('order_statuses').del();

    // Inserts seed entries
    await knex('order_statuses').insert([
        { name: 'Замовлення оброблюється' },
        { name: 'Замовлення відправлене' },
        { name: 'Замовлення чекає у поштовому відділенні' },
        { name: 'Замовлення виконане' },
        { name: 'Замовлення скасоване' },
    ]);
}
