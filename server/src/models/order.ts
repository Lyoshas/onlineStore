import fetch from 'node-fetch';
import crypto from 'crypto';
import { PoolClient } from 'pg';

import dbPool from '../services/postgres.service.js';
import * as userModel from './user.js';
import camelCaseObject from '../util/camelCaseObject.js';

const getIdByNameFromDB = (
    tableName: string,
    name: string
): Promise<number | null> => {
    return dbPool.query(
        // SQL Injections are irrelevant,
        // because user data is not being injected into the query
        `SELECT id FROM ${tableName} WHERE name = $1`,
        [name]
    )
        .then(({ rows }) => rows.length === 0 ? null : rows[0].id);
}

export const getDeliveryMethodIdByName = (
    deliveryMethod: string
): Promise<number | null> => {
    return getIdByNameFromDB('delivery_methods', deliveryMethod);
};

export const getPaymentMethodIdByName = (
    paymentMethodName: string
): Promise<number | null> => {
    return getIdByNameFromDB('order_payment_methods', paymentMethodName);
};

export const getCityIdByName = (
    cityName: string
): Promise<number | null> => {
    return getIdByNameFromDB('cities', cityName);
};

// export const doesDeliveryNameExist = async (
//     deliveryName: string
// ): Promise<boolean> => {
//     const result = getDeliveryMethodIdByName(deliveryName);
//     return result !== null;
// };

export const getOrderRecipients = async (
    userId: number
): Promise<
    {
        firstName: string;
        lastName: string;
        phoneNumber: string;
    }[]
> => {
    const { rows } = await dbPool.query<{
        first_name: string;
        last_name: string;
        phone_number: string;
    }>(
        `
            SELECT first_name, last_name, phone_number
            FROM order_recipients
            WHERE associated_user_id = $1 
        `,
        [userId]
    );

    return rows.map((orderRecipient) => camelCaseObject(orderRecipient));
};

export const createOrder = async (
    userId: number,
    deliveryMethodName: string,
    paymentMethodName: string,
    postOffice: number,
    cityName: string,
    dbClient?: PoolClient
): Promise<number> => {
    const deliveryMethodId = await getDeliveryMethodIdByName(deliveryMethodName);
    const paymentMethodId = await getPaymentMethodIdByName(paymentMethodName);
    const cityId = await getCityIdByName(cityName);

    const client = dbClient || dbPool;

    return client.query(
        `
            INSERT INTO orders (
                user_id,
                delivery_method_id,
                city_id,
                post_office,
                payment_method_id
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `,
        [userId, deliveryMethodId, cityId, postOffice, paymentMethodId]
    )
        .then(({ rows }) => rows[0].id);
};

export const transferCartProductsToOrderProducts = (
    userId: number,
    orderId: number,
    dbClient?: PoolClient
) => {
    const client = dbClient || dbPool;

    return client.query(`
        INSERT INTO orders_products (order_id, product_id, quantity)
        (
            SELECT order_id, product_id, quantity
            FROM carts
            CROSS JOIN (SELECT $1::INTEGER AS order_id) AS derived_table
            WHERE user_id = $2
        )
    `, [orderId, userId]);
};

export const getUserIdByOrderId = (
    orderId: number
): Promise<number | null> => {
    return dbPool.query(
        'SELECT user_id FROM orders WHERE id = $1',
        [orderId]
    ).then(({ rows }) => rows.length === 0 ? null : rows[0].user_id);
};

export const notifyAboutOrderByTelegram = async (orderId: number) => {
    const userId = await getUserIdByOrderId(orderId);
    if (userId === null) throw new Error('userId is incorrect');
    
    const phoneNumber = await userModel.getPhoneNumberByUserId(userId);
    if (phoneNumber === null) throw new Error('phoneNumber is not specified');

    
    const text = await generateOrderSummary(orderId);
    const telegramResponse = await fetch(
        'https://api.telegram.org/bot' + 
        process.env.TELEGRAM_NOTIFICATION_BOT_API_KEY +
        `/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}` +
        `&text=${encodeURI(text)}`,
        { method: 'POST' }
    );
        
    if (telegramResponse.status !== 200) {
        return Promise.reject(
            'An unexpected error occurred while sending the order details to TG'
        );
    }

    return Promise.resolve(telegramResponse);
};

export const generateOrderSummary = (
    orderId: number
) => {
    return dbPool.query(`
        SELECT
            users.first_name,
            users.last_name,
            users.phone_number,
            orders.user_id,
            product_id,
            products.title,
            products.price,
            orders_products.quantity AS quantity_to_order,
            cities.name AS city_name,
            delivery_methods.name AS delivery_method_name,
            orders.post_office,
            o_p_m.name AS payment_method,
            orders.is_paid AS is_order_paid
        FROM orders_products
        INNER JOIN orders ON orders.id = orders_products.order_id
        INNER JOIN products ON products.id = orders_products.product_id
        INNER JOIN delivery_methods ON delivery_methods.id = orders.delivery_method_id
        INNER JOIN cities ON cities.id = orders.city_id
        INNER JOIN order_payment_methods AS o_p_m ON o_p_m.id = orders.payment_method_id
        INNER JOIN users ON users.id = orders.user_id
        WHERE orders.id = $1
    `, [orderId])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject('OrderCreationError: User cart is empty');
            }

            let summary = 
                `Користувач ${rows[0].first_name} ${rows[0].last_name} ` +
                `(\n - id = ${rows[0].user_id},\n - номер телефону = ${rows[0].phone_number}\n)\n` +
                'замовив наступні товари:\n';
            let totalPrice = 0;
            
            rows.forEach((row, index) => {
                totalPrice += +row.price * +row.quantity_to_order;
                summary += 
                    index + 1 + ' товар:\n' + 
                    ' - id товару: ' + row.product_id + '\n' + 
                    ' - назва: ' + row.title + '\n' +
                    ' - кількість: ' + row.quantity_to_order + '\n'; 
            });

            summary +=
                'Доставка:' + '\n' + 
                ' - місто: ' + rows[0].city_name + '\n' +
                ' - спосіб доставки: ' + rows[0].delivery_method_name + '\n' +
                ' - номер відділення: ' + rows[0].post_office + '\n' +
                'Оплата:' + '\n' +
                ' - повна сума до сплати: ' + totalPrice + ' грн' + '\n' +
                ' - спосіб оплати: ' + rows[0].payment_method + '\n' +
                ' - чи оплачене замовлення: ' + (rows[0].is_order_paid ? 'так' : 'ні');

            return summary;
        });
};

// signature = base64_encode( sha1( privateKey + data + privateKey ) )
export const createLiqPaySignature = (value: string): string => {
    return crypto.createHash('sha1').update(value).digest('base64');
};

export const decodeLiqPayData = (encodedBase64Data: string): string => {
    return Buffer.from(encodedBase64Data, 'base64').toString('utf-8');
};

export const getOrderPriceByOrderId = (orderId: number): Promise<number> => {
    return dbPool.query(`
        SELECT SUM(p.price * o_p.quantity)
        FROM orders_products AS o_p
        INNER JOIN products AS p ON o_p.product_id = p.id
        WHERE order_id = $1
    `, [orderId])
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject('Invalid orderId');
            }
            return rows[0].sum;
        });
};

export const getFirstAndLastNameByOrderId = (
    orderId: number
): Promise<string | null> => {
    return dbPool.query(`
        SELECT u.first_name, u.last_name
        FROM orders AS o
        INNER JOIN users AS u ON o.user_id = u.id
        WHERE o.id = $1
    `, [orderId])
        .then(({ rows }) => {
            return rows.length === 0 ? 
                null
                : `${rows[0].first_name} ${rows[0].last_name}`;
        });
};

export const markOrderAsPaid = (orderId: number) => {
    return dbPool.query(
        'UPDATE orders SET is_paid = true WHERE id = $1',
        [orderId]
    );
};
