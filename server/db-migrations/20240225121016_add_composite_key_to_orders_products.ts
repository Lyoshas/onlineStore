import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .alterTable('orders_products', (table) => {
            table.primary(['order_id', 'product_id']);
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .alterTable('orders_products', (table) => {
            table.dropPrimary();
        });
}
