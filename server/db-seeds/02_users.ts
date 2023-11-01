import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('users').del();

    // Inserts seed entries
    await knex('users').insert([
        // adding an administrator
        {
            email: process.env.DB_SEEDING_ADMIN_EMAIL,
            password: process.env.DB_SEEDING_ADMIN_PASSWORD,
            first_name: process.env.DB_SEEDING_ADMIN_FIRST_NAME,
            last_name: process.env.DB_SEEDING_ADMIN_LAST_NAME,
            phone_number: process.env.DB_SEEDING_ADMIN_PHONE_NUMBER || null,
            is_activated: true,
            is_admin: true,
        },
    ]);
}
