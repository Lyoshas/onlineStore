import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('oauth_resource_names').del();

    // Inserts seed entries
    await knex('oauth_resource_names').insert([
        { name: 'google' },
        { name: 'facebook' },
    ]);
}
