import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').createTable('tokens', (table) => {
        table.increments('id').primary();
        table.string('token', 64).notNullable();
        table
            .integer('token_type_id')
            .notNullable()
            .references('id')
            .inTable('token_types')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table
            .integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.timestamp('expires_at').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('tokens');
}
