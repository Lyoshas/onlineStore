import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').alterTable('addresses', (table) => {
        table.string('postal_code', 10).notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').alterTable('addresses', (table) => {
        table.dropColumn('postal_code');
    });
}
