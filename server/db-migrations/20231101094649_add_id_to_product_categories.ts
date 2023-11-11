import { Knex } from 'knex';

// this migration file adds a surrogate key "id" (INT) instead of "category" (VARCHAR(30)) to the 'product_categories' table
export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .alterTable('products', (table) => {
            table.dropColumn('category');
        })
        .alterTable('product_categories', (table) => {
            table.dropPrimary('product_categories_pkey');
        })
        .alterTable('product_categories', (table) => {
            table.increments('id').primary();
            table.unique('category');
        })
        .alterTable('products', (table) => {
            table
                .integer('category_id')
                .notNullable()
                .references('id')
                .inTable('product_categories')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .alterTable('products', (table) => {
            table
                .string('category', 30)
                .references('category')
                .inTable('product_categories')
                .notNullable()
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table.dropColumn('category_id');
        })
        .alterTable('product_categories', (table) => {
            table.dropPrimary('product_categories_pkey');
            table.primary(['category']);
            table.dropColumn('id');
        });
}
