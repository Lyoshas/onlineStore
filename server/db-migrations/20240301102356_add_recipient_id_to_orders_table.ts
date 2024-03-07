import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table
            .integer('recipient_id')
            .notNullable()
            .references('id')
            .inTable('order_recipients')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table.dropColumn('recipient_id');
    });
}
