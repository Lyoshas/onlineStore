import { Knex } from 'knex';
import { SeedOrderRecipient } from './13_order_recipients';

interface Order {
    id: string;
    paymentMethod: 'Оплата при отриманні товару' | 'Оплатити зараз';
    isPaid: boolean;
    statusHistory: {
        statusChangeTime: Date;
        status:
            | 'Замовлення оброблюється'
            | 'Замовлення очікує відправлення'
            | 'Замовлення відправлене'
            | 'Замовлення чекає у поштовому відділенні'
            | 'Замовлення виконане'
            | 'Замовлення скасоване';
    }[];
    recipient: Omit<SeedOrderRecipient, 'associatedUserId'>;
    products: { title: string; quantity: number }[];
}

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('orders').del();
    await knex('orders_products').del();
    await knex('order_status_history').del();

    const currentDate = new Date();

    const orders: Order[] = [
        {
            id: 'ae7e52a9-23bd-40cd-9ab4-32bc7046e342',
            paymentMethod: 'Оплатити зараз',
            isPaid: true,
            recipient: {
                firstName: process.env.DB_SEEDING_ADMIN_FIRST_NAME!,
                lastName: process.env.DB_SEEDING_ADMIN_LAST_NAME!,
                phoneNumber: process.env.DB_SEEDING_ADMIN_PHONE_NUMBER!,
            },
            products: [
                {
                    title: 'Квадрокоптер DJI Mini 2 Fly More Combo (CP.MA.00000307.01)',
                    quantity: 5,
                },
                {
                    title: 'Квадрокоптер DJI Matrice 30T (CP.EN.00000368.02 / 01)',
                    quantity: 3,
                },
            ],
            statusHistory: [
                {
                    status: 'Замовлення оброблюється',
                    statusChangeTime: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        currentDate.getDate(),
                        8,
                        15,
                        53
                    ),
                },
                {
                    status: 'Замовлення очікує відправлення',
                    statusChangeTime: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        currentDate.getDate(),
                        14,
                        53,
                        42
                    ),
                },
                {
                    status: 'Замовлення відправлене',
                    statusChangeTime: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        currentDate.getDate(),
                        15,
                        49,
                        12
                    ),
                },
                {
                    status: 'Замовлення чекає у поштовому відділенні',
                    statusChangeTime: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        currentDate.getDate() + 1,
                        11,
                        23,
                        12
                    ),
                },
                {
                    status: 'Замовлення виконане',
                    statusChangeTime: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1,
                        currentDate.getDate() + 1,
                        17,
                        57,
                        51
                    ),
                },
            ],
        },
        {
            id: '3e629ffd-c2fb-4ea9-a4a0-2d725c15e84a',
            paymentMethod: 'Оплата при отриманні товару',
            isPaid: false,
            recipient: {
                firstName: process.env.DB_SEEDING_ADMIN_FIRST_NAME!,
                lastName: process.env.DB_SEEDING_ADMIN_LAST_NAME!,
                phoneNumber: process.env.DB_SEEDING_ADMIN_PHONE_NUMBER!,
            },
            products: [
                {
                    title: 'PlayStation 5 Ultra HD Blu-ray Call of Duty: Modern Warfare III',
                    quantity: 1,
                },
                {
                    title: 'Nintendo Switch OLED Біла',
                    quantity: 1,
                },
            ],
            statusHistory: [
                {
                    status: 'Замовлення оброблюється',
                    statusChangeTime: new Date(
                        +currentDate - 4 * 60 * 60 * 1000
                    ), // subtract 4 hours from the current time
                },
            ],
        },
        {
            id: '59adaa4a-cbc3-49a6-b356-85a3cba9b39d',
            paymentMethod: 'Оплатити зараз',
            isPaid: false,
            recipient: {
                firstName: 'Сергій',
                lastName: 'Ткаченко',
                phoneNumber: '+380-12-345-67-89',
            },
            products: [
                {
                    title: 'Ноутбук Acer Aspire 7 A715-42G-R5B1',
                    quantity: 1,
                },
            ],
            statusHistory: [
                {
                    status: 'Замовлення оброблюється',
                    statusChangeTime: new Date(
                        +currentDate - 3 * 60 * 60 * 1000
                    ), // subtract 3 hours from the current time
                },
            ],
        },
        {
            id: '54b001d4-e388-43e2-86d2-e10640141ded',
            paymentMethod: 'Оплата при отриманні товару',
            isPaid: false,
            recipient: {
                firstName: 'Єлизавета',
                lastName: 'Прокопенко',
                phoneNumber: '+380-23-456-78-90',
            },
            products: [
                {
                    title: "Комп'ютер ARTLINE Gaming ASUS Edition X43 (X43v33) Ryzen 5 3600/RAM 16ГБ/HDD 1ТБ + SSD 240ГБ/GeForce RTX 3050 8ГБ/Wi-Fi",
                    quantity: 1,
                },
            ],
            statusHistory: [
                {
                    status: 'Замовлення оброблюється',
                    statusChangeTime: new Date(
                        +currentDate - 2 * 60 * 60 * 1000
                    ), // subtract 2 hours from the current time
                },
            ],
        },
    ];

    // creating orders (without products)
    await knex('orders').insert(
        orders.map((order) => ({
            id: order.id,
            payment_method_id: knex('order_payment_methods')
                .select('id')
                .where({ name: order.paymentMethod }),
            is_paid: order.isPaid,
            delivery_warehouse_id: knex('postal_service_warehouses')
                .select('id')
                .orderByRaw('RANDOM()')
                .limit(1),
            recipient_id: knex('order_recipients')
                .select('id')
                .where({
                    associated_user_id: knex('users').select('id').where({
                        email: process.env.DB_SEEDING_ADMIN_EMAIL,
                    }),
                    first_name: order.recipient.firstName,
                    last_name: order.recipient.lastName,
                    phone_number: order.recipient.phoneNumber,
                }),
        }))
    );

    for (let order of orders) {
        // associating products with the created orders
        await knex('orders_products').insert(
            order.products.map((orderProduct) => ({
                order_id: order.id,
                product_id: knex('products')
                    .select('id')
                    .where({ title: orderProduct.title }),
                quantity: orderProduct.quantity,
            }))
        );

        // inserting statuses for the created orders
        await knex('order_status_history').insert(
            order.statusHistory.map((history) => ({
                order_id: order.id,
                status_id: knex('order_statuses')
                    .select('id')
                    .where({ name: history.status }),
                change_time: history.statusChangeTime,
            }))
        );
    }
}
