import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('order_status_history', (table) => {
            // creates a table that tracks the history of changes in the status of orders
            // it's up to the backend application to ensure the integrity of this table
            table
                .integer('order_id')
                .notNullable()
                .references('id')
                .inTable('orders')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table
                .integer('status_id')
                .notNullable()
                .references('id')
                .inTable('order_statuses')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table.primary(['order_id', 'status_id']);
            table
                .timestamp('change_time')
                .notNullable()
                .defaultTo(knex.fn.now());
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('order_status_history');
}
