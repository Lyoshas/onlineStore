import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('oauth_resource_names', (table) => {
            table.increments('id').primary();
            table.string('name', 20).notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('oauth_resource_names');
}
