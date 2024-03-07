import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table.dropColumn('user_id');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.withSchema('public').table('orders', (table) => {
        table
            .integer('user_id')
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
}
