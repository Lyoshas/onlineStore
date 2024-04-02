import { Knex } from 'knex';
import snakeCaseObject from '../src/util/snakeCaseObject.js';

export interface SeedOrderRecipient {
    associatedUserId: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('order_recipients').del();

    const getAdminUserIdSubquery = knex('users')
        .select('id')
        .where({ email: process.env.DB_SEEDING_ADMIN_EMAIL });

    const orderRecipients: Omit<SeedOrderRecipient, 'associatedUserId'>[] = [
        {
            firstName: process.env.DB_SEEDING_ADMIN_FIRST_NAME!,
            lastName: process.env.DB_SEEDING_ADMIN_LAST_NAME!,
            phoneNumber: process.env.DB_SEEDING_ADMIN_PHONE_NUMBER!,
        },
        {
            firstName: 'Сергій',
            lastName: 'Ткаченко',
            phoneNumber: '+380-12-345-67-89',
        },
        {
            firstName: 'Єлизавета',
            lastName: 'Прокопенко',
            phoneNumber: '+380-23-456-78-90',
        },
    ];

    // Inserts seed entries
    await knex('order_recipients').insert(
        orderRecipients.map((recipient) =>
            snakeCaseObject({
                ...recipient,
                associatedUserId: getAdminUserIdSubquery,
            })
        )
    );
}
