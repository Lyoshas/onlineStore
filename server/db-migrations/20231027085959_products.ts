import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').createTable('products', (table) => {
        table.increments('id').primary();
        table.string('title', 200).notNullable().checkLength('>', 0);
        table.decimal('price', 9, 2).notNullable().checkPositive();
        table.string('initial_image_url', 300).notNullable();
        table.string('additional_image_url', 300).notNullable();
        table.smallint('quantity_in_stock').notNullable();
        table.check('quantity_in_stock >= 0');
        table
            .string('short_description', 300)
            .notNullable()
            .checkLength('>', 0);
        table
            .string('category', 30)
            .notNullable()
            .references('category')
            .inTable('product_categories')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
        table
            .smallint('max_order_quantity')
            .defaultTo(32767)
            .notNullable()
            .checkPositive();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('products');
}
