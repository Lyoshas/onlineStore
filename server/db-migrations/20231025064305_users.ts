import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').createTable('users', (table) => {
        table.increments('id').primary();
        table.string('email', 254).unique().notNullable();
        table.string('password', 60).notNullable();
        table.string('first_name', 50).notNullable();
        table.string('last_name', 50).notNullable();
        table
            .string('phone_number', 50)
            .unique()
            .nullable()
            .checkRegex('^\\+380-\\d{2}-\\d{3}(-\\d{2}){2}$');
        table
            .integer('address_id')
            .nullable()
            .references('id')
            .inTable('addresses')
            .onUpdate('CASCADE')
            .onDelete('RESTRICT');
        table.boolean('is_activated').notNullable().defaultTo(false);
        table.boolean('is_admin').notNullable().defaultTo(false);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('users');
}
