import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').createTable('carts', (table) => {
        table.increments('id').primary();
        table
            .integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table
            .integer('product_id')
            .notNullable()
            .references('id')
            .inTable('products')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.smallint('quantity').notNullable().checkPositive();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('carts');
}
