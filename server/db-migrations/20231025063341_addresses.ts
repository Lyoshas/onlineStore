import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('addresses', (table) => {
            table.increments('id').primary();
            table
                .integer('city_id')
                .references('id')
                .inTable('cities')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
            table.string('street_name', 50).notNullable();
            table.string('house_number', 10).notNullable();
            table.smallint('apartment_number').nullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('addresses');
}
