import { Knex } from 'knex';

const currentDate = new Date();

const warrantyRequests: {
    id: number;
    serialNumber: string;
    issueDescription: string;
    serviceCenterId: number;
    productCategory: string;
    statusHistory: {
        statusChangeTime: Date;
        status:
            | 'Товар зданий у сервіс'
            | 'Сервісний центр оцінює стан товару'
            | 'Не було знайдено жодних дефектів; товар очікує клієнта в сервісному центрі'
            | 'Йдуть ремонтні роботи'
            | 'Відремонтований товар чекає клієнта в сервісному центрі'
            | 'Товар був успішно отриманий';
    }[];
}[] = [
    {
        id: 1,
        serialNumber: 'TQfLnfrNak',
        issueDescription: 'Зелені полоси на екрані',
        serviceCenterId: 1,
        productCategory: 'Монітори',
        statusHistory: [
            {
                status: 'Товар зданий у сервіс',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    currentDate.getDate(),
                    9,
                    34,
                    26
                ),
            },
            {
                status: 'Сервісний центр оцінює стан товару',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    currentDate.getDate(),
                    10,
                    7,
                    53
                ),
            },
            {
                status: 'Йдуть ремонтні роботи',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    currentDate.getDate(),
                    11,
                    48,
                    15
                ),
            },
            {
                status: 'Відремонтований товар чекає клієнта в сервісному центрі',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    currentDate.getDate() + 3,
                    14,
                    36,
                    12
                ),
            },
            {
                status: 'Товар був успішно отриманий',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    currentDate.getDate() + 3,
                    18,
                    58,
                    1
                ),
            },
        ],
    },
    {
        id: 2,
        serialNumber: 'YBEfTGp6JJ',
        issueDescription: 'Непрацюючі динаміки',
        serviceCenterId: 2,
        productCategory: 'Ноутбуки',
        statusHistory: [
            {
                status: 'Товар зданий у сервіс',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    currentDate.getDate() + 5,
                    9,
                    34,
                    26
                ),
            },
            {
                status: 'Сервісний центр оцінює стан товару',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    currentDate.getDate() + 5,
                    10,
                    7,
                    53
                ),
            },
            {
                status: 'Не було знайдено жодних дефектів; товар очікує клієнта в сервісному центрі',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    currentDate.getDate() + 5,
                    13,
                    48,
                    15
                ),
            },
            {
                status: 'Товар був успішно отриманий',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    currentDate.getDate() + 5,
                    18,
                    52,
                    1
                ),
            },
        ],
    },
    {
        id: 3,
        serialNumber: 'h2p99pd2zs',
        issueDescription: 'Неправильно працюючі датчики',
        serviceCenterId: 3,
        productCategory: 'Дрони',
        statusHistory: [
            {
                status: 'Товар зданий у сервіс',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() - 1,
                    9,
                    34,
                    26
                ),
            },
            {
                status: 'Сервісний центр оцінює стан товару',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() - 1,
                    14,
                    7,
                    53
                ),
            },
            {
                status: 'Йдуть ремонтні роботи',
                statusChangeTime: new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() - 1,
                    18,
                    48,
                    15
                ),
            },
        ],
    },
];

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('warranty_requests').del();
    await knex('warranty_request_status_history').del();

    const adminUserId = knex('users')
        .select('id')
        .where({ email: process.env.DB_SEEDING_ADMIN_EMAIL! });
    const getRandomProductIdByCategory = (category: string) => {
        return knex('products')
            .select('products.id')
            .innerJoin(
                'product_categories',
                'product_categories.id',
                '=',
                'products.category_id'
            )
            .where({ 'product_categories.category': category })
            .orderByRaw('RANDOM()')
            .limit(1);
    };

    // Inserts seed entries
    await knex('warranty_requests').insert(
        warrantyRequests.map((request) => ({
            id: request.id,
            serial_number: request.serialNumber,
            issue_description: request.issueDescription,
            user_id: adminUserId,
            product_id: getRandomProductIdByCategory(request.productCategory),
            service_center_id: request.serviceCenterId,
        }))
    );

    for (let warrantyRequest of warrantyRequests) {
        await knex('warranty_request_status_history').insert(
            warrantyRequest.statusHistory.map((statusEntry) => ({
                warranty_request_id: warrantyRequest.id,
                status_id: knex('warranty_request_statuses')
                    .select('id')
                    .where({ name: statusEntry.status }),
                change_time: statusEntry.statusChangeTime,
            }))
        );
    }
}
