import { randomInt } from 'crypto';
import { Knex } from 'knex';

import snakeCaseObject from '../src/util/snakeCaseObject.js';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('fundraising_transactions').del();

    const randomUserId = knex('users')
        .select('id')
        .orderByRaw('RANDOM()')
        .limit(1);

    const fundraisingTransactions: {
        campaignId: number;
        donationAmount: number;
        isPaid: boolean;
    }[] = [
        // campaign with the ID 1 must be finished
        {
            campaignId: 1,
            donationAmount: 40_000,
            isPaid: true,
        },
        {
            campaignId: 1,
            donationAmount: 65_000,
            isPaid: true,
        },
        {
            campaignId: 1,
            donationAmount: 65_000,
            isPaid: false,
        },
        {
            campaignId: 1,
            donationAmount: 102_452.57,
            isPaid: true,
        },
        {
            campaignId: 1,
            donationAmount: 82_547.43,
            isPaid: true,
        },
        {
            campaignId: 2,
            donationAmount: randomInt(30_000, 60_000),
            isPaid: true,
        },
        {
            campaignId: 2,
            donationAmount: randomInt(30_000, 60_000),
            isPaid: false,
        },
        {
            campaignId: 2,
            donationAmount: randomInt(30_000, 60_000),
            isPaid: true,
        },
        {
            campaignId: 3,
            donationAmount: randomInt(60_000, 100_000),
            isPaid: true,
        },
        {
            campaignId: 3,
            donationAmount: randomInt(60_000, 100_000),
            isPaid: true,
        },
        {
            campaignId: 3,
            donationAmount: randomInt(60_000, 100_000),
            isPaid: false,
        },
    ];

    // Inserts seed entries
    await knex('fundraising_transactions').insert(
        fundraisingTransactions.map((transactionSummary) => ({
            ...snakeCaseObject(transactionSummary),
            user_id: randomUserId,
        }))
    );
}
