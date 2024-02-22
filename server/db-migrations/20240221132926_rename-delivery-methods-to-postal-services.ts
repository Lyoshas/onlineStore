import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .renameTable('delivery_methods', 'postal_services');
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .renameTable('postal_services', 'delivery_methods');
}
