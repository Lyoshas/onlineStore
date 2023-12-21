import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .alterTable('product_categories', (table) => {
            table.string('preview_url').notNullable();
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .alterTable('product_categories', (table) => {
            table.dropColumn('preview_url');
        });
}
