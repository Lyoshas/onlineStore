import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('warranty_request_statuses', (table) => {
            table.increments('id').primary();
            table.string('name', 100).notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .dropTable('warranty_request_statuses');
}
