import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .renameTable('moderation_statuses', 'review_moderation_statuses');
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .renameTable('review_moderation_statuses', 'moderation_statuses');
}
