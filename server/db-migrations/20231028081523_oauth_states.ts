import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('oauth_states', (table) => {
            table.increments('id').primary();
            table.string('state', 64).notNullable();
            table
                .integer('resource_name_id')
                .notNullable()
                .references('id')
                .inTable('oauth_resource_names')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('oauth_states');
}
