import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('cities').del();

    // Inserts seed entries
    await knex('cities').insert([{ id: 1, name: 'Київ' }]);
}
