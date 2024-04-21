import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('fundraising_campaigns', (table) => {
            table.increments('id').primary();
            table.string('title', 300).notNullable();
            table.integer('financial_objective').checkPositive().notNullable();
            /**
             * The value of the 'is_finished' column can be inferred from the 'fundraising_transactions' table.
             * While it's generally advised against storing derived data, in this instance, it's justified.
             * The 'is_finished' column is expected to have infrequent changes. Calculating it on-the-fly 
             * with a correlated subquery during retrieval of finished/ongoing fundraising campaigns is 
             * resource-intensive.
             */
            table.boolean('is_finished').notNullable().defaultTo(false);
            table.string('preview_url', 300).notNullable();
            table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('fundraising_campaigns');
}
