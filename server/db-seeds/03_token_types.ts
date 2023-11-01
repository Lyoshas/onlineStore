import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('token_types').del();

    // Inserts seed entries
    await knex('token_types').insert([{ type: 'refresh' }, { type: 'reset' }]);
}
