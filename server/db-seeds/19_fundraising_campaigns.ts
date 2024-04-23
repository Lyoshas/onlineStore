import { Knex } from 'knex';
import snakeCaseObject from '../src/util/snakeCaseObject.js';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('fundraising_campaigns').del();

    const fundraisingCampaigns: {
        id: number;
        title: string;
        financialObjective: number;
        isFinished?: boolean;
        previewUrl: string;
    }[] = [
        {
            id: 1,
            title: 'Збір на авто для 23 окремої механізованої бригади',
            financialObjective: 290000,
            isFinished: true,
            previewUrl:
                'https://onlinestore-product-images.s3.eu-north-1.amazonaws.com/31091ae5-9b05-4dee-82ed-f350ee69f4a2.png',
        },
        {
            id: 2,
            title: 'Збір на дрони для 54 окремої механізованої бригади',
            financialObjective: 295000,
            previewUrl:
                'https://onlinestore-product-images.s3.eu-north-1.amazonaws.com/255db5b8-6df6-404f-8a3d-6eeabab4e975.png',
        },
        {
            id: 3,
            title: 'Збір на дрони для 23 окремої механізованої бригади',
            financialObjective: 400000,
            previewUrl:
                'https://onlinestore-product-images.s3.eu-north-1.amazonaws.com/25139a87-3d4e-4d70-9677-c6353f9d6b1f.png',
        },
    ];

    // Inserts seed entries
    await knex('fundraising_campaigns').insert(
        fundraisingCampaigns.map((campaign) => snakeCaseObject(campaign))
    );
}
