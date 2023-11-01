import { Knex } from 'knex';

// a surrogate key wasn't added because if a user wanted to get a list of products, an INNER JOIN would be required to include the category name
export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('product_categories', (table) => {
            table.string('category', 30).primary();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('product_categories');
}
