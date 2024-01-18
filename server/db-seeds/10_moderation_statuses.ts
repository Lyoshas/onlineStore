import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('moderation_statuses').del();

    // Inserts seed entries
    await knex('moderation_statuses').insert([
        { name: 'pending' },
        { name: 'approved' },
        { name: 'rejected' },
    ]);
}
