import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table.dropColumn('city_id');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table
            .integer('city_id')
            .notNullable()
            .references('id')
            .inTable('cities')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}
