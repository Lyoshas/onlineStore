import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .table('orders_products', (table) => {
            table.dropColumn('id');
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .table('orders_products', (table) => {
            table.increments('id').primary();
        });
}
