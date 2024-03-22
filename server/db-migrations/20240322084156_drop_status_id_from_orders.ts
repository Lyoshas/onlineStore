import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table.dropColumn('status_id');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table
            .integer('status_id')
            .notNullable()
            .references('id')
            .inTable('order_statuses')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}
