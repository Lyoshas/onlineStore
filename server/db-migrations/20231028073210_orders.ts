import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').createTable('orders', (table) => {
        table.increments('id').primary();
        table
            .integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table
            .integer('delivery_method_id')
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
        table.string('post_office', 50).nullable();
        table
            .integer('payment_method_id')
            .notNullable()
            .references('id')
            .inTable('order_payment_methods')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.boolean('is_paid').notNullable().defaultTo(false);
        table
            .integer('status_id')
            .notNullable()
            .references('id')
            .inTable('order_statuses')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('orders');
}
