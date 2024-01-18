import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('product_reviews', (table) => {
            table
                .integer('product_id')
                .references('id')
                .inTable('products')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table
                .integer('user_id')
                .references('id')
                .inTable('users')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table.string('review_message', 2000).notNullable();
            table
                .decimal('star_rating', 2, 1)
                .notNullable()
                .checkBetween([1, 5]);
            table
                .integer('moderation_status_id')
                .notNullable()
                .references('id')
                .inTable('moderation_statuses')
                .onUpdate('CASCADE')
                // prevent the deletion if any referencing records exist
                .onDelete('RESTRICT');
            table
                .date('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
            table.primary(['product_id', 'user_id']);
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('product_reviews');
}
