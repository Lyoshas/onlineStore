import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('moderation_statuses', (table) => {
            table.increments('id').primary();
            table.string('name', 10).notNullable().unique();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('moderation_statuses');
}
