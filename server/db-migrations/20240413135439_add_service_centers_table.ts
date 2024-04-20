import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('service_centers', (table) => {
            table.increments('id').primary();
            table
                .integer('address_id')
                .references('id')
                .inTable('addresses')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('service_centers');
}
