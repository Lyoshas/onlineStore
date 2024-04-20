import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('warranty_request_status_history', (table) => {
            table
                .integer('warranty_request_id')
                .references('id')
                .inTable('warranty_requests')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
            table
                .integer('status_id')
                .references('id')
                .inTable('warranty_request_statuses')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
            table.primary(['warranty_request_id', 'status_id']);
            table
                .timestamp('change_time')
                .notNullable()
                .defaultTo(knex.fn.now());
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .dropTable('warranty_request_status_history');
}
