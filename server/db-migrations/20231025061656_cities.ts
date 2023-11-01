import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').createTable('cities', (table) => {
        table.increments('id').primary();
        table.string('name', 30).notNullable().unique();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('cities');
}
