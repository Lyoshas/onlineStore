import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('postal_service_warehouses', (table) => {
            table.increments('id').primary();
            table
                .integer('postal_service_id')
                .notNullable()
                .references('id')
                .inTable('delivery_methods')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table
                .integer('city_id')
                .notNullable()
                .references('id')
                .inTable('cities')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table.string('warehouse_description', 200).notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .dropTable('postal_service_warehouses');
}
