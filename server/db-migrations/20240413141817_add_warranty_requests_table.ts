import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('warranty_requests', (table) => {
            table.increments('id').primary();
            table.string('serial_number', 20).notNullable();
            table.string('issue_description', 1000).notNullable();
            table
                .integer('user_id')
                .references('id')
                .inTable('users')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
            table
                .integer('product_id')
                .references('id')
                .inTable('products')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
            table
                .integer('service_center_id')
                .references('id')
                .inTable('service_centers')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('warranty_requests');
}
