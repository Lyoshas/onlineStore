import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .table('postal_service_warehouses', (table) => {
            table.unique(['city_id', 'warehouse_description']);
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .table('postal_service_warehouses', (table) => {
            table.dropUnique(['city_id', 'warehouse_description']);
        });
}
