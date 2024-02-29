import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .withSchema('public')
        .createTable('order_recipients', (table) => {
            table.increments('id').primary();
            table
                .integer('associated_user_id')
                .references('id')
                .inTable('users')
                .onUpdate('CASCADE')
                .onDelete('CASCADE')
                .notNullable();
            table.string('first_name', 50).notNullable();
            table.string('last_name', 50).notNullable();
            table
                .string('phone_number', 50)
                .notNullable()
                .checkRegex('^\\+380-\\d{2}-\\d{3}(-\\d{2}){2}$');
            // a single user is not allowed to have exactly the same order recipients
            table.unique([
                'associated_user_id',
                'first_name',
                'last_name',
                'phone_number',
            ]);
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').dropTable('order_recipients');
}
