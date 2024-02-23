import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('users', (table) => {
        table.dropColumn('phone_number');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('users', (table) => {
        table
            .string('phone_number', 50)
            .unique()
            .nullable()
            .checkRegex('^\\+380-\\d{2}-\\d{3}(-\\d{2}){2}$');
    });
}
