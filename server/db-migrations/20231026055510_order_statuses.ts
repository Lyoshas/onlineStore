import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('order_statuses', (table) => {
            table.increments('id').primary();
            table.string('name', 100).unique().notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('order_statuses');
}
