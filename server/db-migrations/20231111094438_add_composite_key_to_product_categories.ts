import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').alterTable('carts', (table) => {
        table.dropColumn('id');
        table.primary(['user_id', 'product_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .alterTable('carts', (table) => {
            table.dropPrimary('carts_pkey');
        })
        .alterTable('carts', (table) => {
            table.increments('id').primary();
        });
}
