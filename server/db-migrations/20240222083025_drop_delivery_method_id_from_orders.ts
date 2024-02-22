import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table.dropColumn('delivery_method_id');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table
            .integer('delivery_method_id')
            .notNullable()
            .references('id')
            .inTable('postal_services')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}
