import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('fundraising_transactions', (table) => {
            table.increments('id').primary();
            table
                .integer('user_id')
                .references('id')
                .inTable('users')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
            table
                .integer('campaign_id')
                .references('id')
                .inTable('fundraising_campaigns')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
            table
                .decimal('donation_amount', 9, 2)
                .notNullable()
                .checkPositive();
            table.boolean('is_paid').notNullable().defaultTo(false);
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .dropTable('fundraising_transactions');
}
