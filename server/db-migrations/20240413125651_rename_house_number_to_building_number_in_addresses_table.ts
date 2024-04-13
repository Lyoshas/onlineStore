import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').alterTable('addresses', (table) => {
        table.renameColumn('house_number', 'building_number');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').alterTable('addresses', (table) => {
        table.renameColumn('building_number', 'house_number');
    });
}
