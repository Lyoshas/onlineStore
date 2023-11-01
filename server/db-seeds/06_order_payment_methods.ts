import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('order_payment_methods').del();

    // Inserts seed entries
    await knex('order_payment_methods').insert([
        { name: 'Оплата при отриманні товару' },
        { name: 'Оплатити зараз' },
    ]);
}
