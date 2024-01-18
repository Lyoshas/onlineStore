import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('product_review_comments', (table) => {
            table.increments('id').primary();
            // 'review_product_id' and 'review_owner_id' will reference the composite primary key of the 'product_reviews' table
            table.integer('review_product_id').notNullable();
            table.integer('review_owner_id').notNullable();
            table
                .foreign(['review_product_id', 'review_owner_id'])
                .references(['product_id', 'user_id'])
                .inTable('product_reviews')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table
                .integer('comment_owner_id')
                .notNullable()
                .references('id')
                .inTable('users')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table.string('comment_message', 2000).notNullable();
            table
                .integer('moderation_status_id')
                .notNullable()
                .references('id')
                .inTable('moderation_statuses')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .dropTable('product_review_comments');
}
