import fetch from 'node-fetch';
import crypto from 'crypto';
import { PoolClient, Pool } from 'pg';

import dbPool from '../services/postgres.service.js';
import knex from '../services/knex.service.js';
import formatSqlQuery from '../util/formatSqlQuery.js';
import camelCaseObject from '../util/camelCaseObject.js';
import OrderRecipient from '../interfaces/OrderRecipient.js';
import formatCurrencyUAH from '../util/formatCurrencyUAH.js';
import OrderSummary from '../interfaces/OrderSummary.js';
import { sendEmail } from '../services/email.service.js';
import LiqpayDecodedData from '../interfaces/LiqpayDecodedData.js';
import CamelCaseProperties from '../interfaces/CamelCaseProperties.js';
import { base64Decode } from '../util/base64.js';

// a separate class was created because almost all methods of this class
// will be used inside a DB transaction
// it was decided to centralize the DB client inside a class instead of passing it
// to every exported function, which would increase code duplication
class OrderModel {
    private dbClient: PoolClient | Pool;

    constructor(dbClient?: PoolClient) {
        this.dbClient = dbClient || dbPool;
    }

    public async getOrderRecipients(userId: number): Promise<
        {
            firstName: string;
            lastName: string;
            phoneNumber: string;
        }[]
    > {
        const { rows } = await this.dbClient.query<{
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
    }

    public async addOrderRecipient(
        orderRecipient: OrderRecipient
    ): Promise<number> {
        const { userId, firstName, lastName, phoneNumber } = orderRecipient;

        const { rows } = await this.dbClient.query<{ id: number }>(
            `
            INSERT INTO order_recipients (
                associated_user_id,
                first_name,
                last_name,
                phone_number
            ) VALUES ($1, $2, $3, $4)
            RETURNING id
        `,
            [userId, firstName, lastName, phoneNumber]
        );
        return rows[0].id;
    }

    // this function returns order recipient ID
    // if the recipient wasn't found, this function returns 'null'
    public async getOrderRecipientId(
        orderRecipient: OrderRecipient
    ): Promise<number | null> {
        const { userId, firstName, lastName, phoneNumber } = orderRecipient;

        const { rows, rowCount } = await this.dbClient.query<{ id: number }>(
            `
                SELECT id
                FROM order_recipients
                WHERE
                    associated_user_id = $1
                    AND first_name = $2
                    AND last_name = $3
                    AND phone_number = $4
            `,
            [userId, firstName, lastName, phoneNumber]
        );

        return rowCount > 0 ? rows[0].id : null;
    }

    public async createOrder(
        recipientId: number,
        paymentMethodName: string,
        cityName: string,
        warehouseDescription: string
    ): Promise<number> {
        const { rows } = await this.dbClient.query<{ id: number }>(
            `
                INSERT INTO orders (
                    recipient_id,
                    payment_method_id,
                    is_paid,
                    status_id,
                    delivery_warehouse_id
                ) VALUES (
                    $1,
                    (SELECT id FROM order_payment_methods WHERE name = $2),
                    false,
                    (
                        SELECT id
                        FROM order_statuses
                        WHERE name = 'Замовлення оброблюється'
                    ),
                    (
                        SELECT id
                        FROM postal_service_warehouses
                        WHERE city_id = (
                            SELECT id FROM cities WHERE name = $3
                        ) AND warehouse_description = $4
                    )
                )
                RETURNING id
            `,
            [recipientId, paymentMethodName, cityName, warehouseDescription]
        );

        return rows[0].id;
    }

    // use this only for anonymous users
    // this function doesn't check if the provided products are available
    public async associateProductsWithOrder(
        orderId: number,
        products: { productId: number; quantity: number }[]
    ): Promise<void> {
        const sqlQuery = knex('orders_products')
            .insert(
                products.map((product) => ({
                    order_id: orderId,
                    product_id: product.productId,
                    quantity: product.quantity,
                }))
            )
            .toQuery();

        await this.dbClient.query(sqlQuery);
    }

    // use this for authenticated users when creating an order
    public async copyCartProductsToOrderProducts(
        userId: number,
        orderId: number
    ) {
        return this.dbClient.query(
            formatSqlQuery(
                `
                    INSERT INTO orders_products (order_id, product_id, quantity)
                    (
                        SELECT
                            $1::INTEGER as order_id,
                            product_id,
                            quantity AS cart_quantity
                        FROM carts
                        INNER JOIN products ON products.id = carts.product_id
                        WHERE
                            user_id = $2
                            AND carts.quantity <= products.quantity_in_stock
                            AND carts.quantity <= products.max_order_quantity
                    )
                `
            ),
            [orderId, userId]
        );
    }

    public async getOrderSummary(orderId: number): Promise<OrderSummary> {
        let {
            rows: [orderInfo],
        } = await this.dbClient.query<{
            order_products: {
                product_id: number;
                title: string;
                order_quantity: number;
                price: number;
            }[];
            total_price: number;
        }>(
            formatSqlQuery(`
                SELECT
                    json_agg(t) AS order_products,
                    (
                        SELECT
                            SUM(orders_products.quantity * products.price)
                        FROM orders_products
                        INNER JOIN products
                            ON products.id = orders_products.product_id
                        WHERE order_id = $1
                    ) AS total_price
                FROM (
                    SELECT
                        p.id AS product_id,
                        p.title,
                        op.quantity AS order_quantity,
                        p.price
                    FROM orders_products AS op
                    INNER JOIN products AS p ON p.id = op.product_id
                    WHERE order_id = $1
                ) AS t;
            `),
            [orderId]
        );

        return camelCaseObject(orderInfo);
    }

    public async stringifyOrderSummary(orderId: number): Promise<string> {
        const { rows } = await this.dbClient.query<{
            user_id: number;
            account_first_name: string;
            account_last_name: string;
            recipient_first_name: string;
            recipient_last_name: string;
            recipient_phone_number: string;
            is_order_paid: boolean;
            delivery_warehouse_description: string;
            postal_service_name: string;
            postal_warehouse_city: string;
            payment_method: string;
            order_products: {
                product_id: number;
                title: string;
                price: number;
                quantity_to_order: number;
            }[];
        }>(
            formatSqlQuery(
                `
                SELECT
                    users.id AS user_id,
                    users.first_name AS account_first_name,
                    users.last_name AS account_last_name,
                    recipients.first_name AS recipient_first_name,
                    recipients.last_name AS recipient_last_name,
                    recipients.phone_number AS recipient_phone_number,
                    orders.is_paid AS is_order_paid,
                    post_warehouses.warehouse_description AS delivery_warehouse_description,
                    postal_services.name AS postal_service_name,
                    cities.name AS postal_warehouse_city,
                    payment_methods.name AS payment_method,
                    /**
                        * selecting products that are associated with the order ID as JSON
                        * this JSON adheres to this schema:
                        * { title: string; quantity_to_order: number }[]
                        */
                    (
                        SELECT json_agg(t)
                        FROM (
                            SELECT
                                products.id AS product_id,
                                products.title,
                                products.price,
                                orders_products.quantity AS quantity_to_order
                            FROM orders_products
                            INNER JOIN products
                                ON products.id = orders_products.product_id
                            WHERE order_id = $1
                        ) AS t
                    ) AS order_products
                FROM orders
                INNER JOIN order_recipients AS recipients
                    ON recipients.id = orders.recipient_id
                INNER JOIN users ON users.id = recipients.associated_user_id
                INNER JOIN postal_service_warehouses AS post_warehouses
                    ON post_warehouses.id = orders.delivery_warehouse_id
                INNER JOIN postal_services
                    ON postal_services.id = post_warehouses.postal_service_id
                INNER JOIN cities ON cities.id = post_warehouses.city_id
                INNER JOIN order_payment_methods AS payment_methods
                    ON payment_methods.id = orders.payment_method_id
                WHERE orders.id = $1;
                `
            ),
            [orderId]
        );

        const orderInfo = camelCaseObject(rows[0]);

        if (rows.length === 0) {
            return Promise.reject('OrderCreationError: User cart is empty');
        }

        let summary =
            `Акаунт з ID ${orderInfo.userId} (${orderInfo.accountFirstName} ${orderInfo.accountLastName}) ` +
            'замовив наступні товари:\n\n';

        let numericTotalPrice: number = 0;
        orderInfo.orderProducts.forEach((product, index) => {
            numericTotalPrice += +product.price * +product.quantityToOrder;
            summary +=
                `${index + 1} товар:\n` +
                ` - id товару: ${product.productId}\n` +
                ` - назва: ${product.title}\n` +
                ` - кількість: ${product.quantityToOrder}\n` +
                ` - ціна за одиницю: ${formatCurrencyUAH(product.price)}\n`;
        });

        summary +=
            '\nДоставка:\n' +
            ` - місто: ${orderInfo.postalWarehouseCity}\n` +
            ` - спосіб доставки: ${orderInfo.postalServiceName}\n` +
            ` - опис відділення: ${orderInfo.deliveryWarehouseDescription}\n` +
            '\nОплата:\n' +
            ` - повна сума до сплати: ${formatCurrencyUAH(
                numericTotalPrice
            )}\n` +
            ` - спосіб оплати: ${orderInfo.paymentMethod}\n` +
            ` - чи оплачене замовлення: ${
                orderInfo.isOrderPaid ? 'так' : 'ні'
            }\n` +
            `\nОдержувач замовлення:\n` +
            ` - Повне ім'я: ${orderInfo.recipientFirstName} ${orderInfo.recipientLastName}\n` +
            ` - Номер телефону: ${orderInfo.recipientPhoneNumber}`;

        return summary;
    }

    public async notifyAboutOrderByTelegram(orderId: number) {
        const text = await this.stringifyOrderSummary(orderId);
        const telegramResponse = await fetch(
            'https://api.telegram.org/bot' +
                process.env.TELEGRAM_NOTIFICATION_BOT_API_KEY +
                `/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}` +
                `&text=${encodeURI(text)}`,
            { method: 'POST' }
        );

        if (telegramResponse.status !== 200) {
            return Promise.reject(
                'An unexpected error occurred while sending the order details to the manager via Telegram'
            );
        }

        return Promise.resolve(telegramResponse);
    }

    // use it only inside the order creation endpoint
    public createLiqPayFormData(args: {
        orderInfo: {
            orderId: number;
            recipientFirstName: string;
            recipientLastName: string;
            totalPrice: number;
        };
        userId: number;
    }): { data: string; signature: string } {
        const { orderId, recipientFirstName, recipientLastName, totalPrice } =
            args.orderInfo;
        const userId = args.userId;

        const data = Buffer.from(
            JSON.stringify({
                version: 3,
                public_key: process.env.LIQPAY_PUBLIC_KEY,
                action: 'pay',
                amount: totalPrice,
                currency: 'UAH',
                description:
                    `Оплата замовлення №${orderId} користувачем з ID ${userId}\n` +
                    `Отримувач: ${recipientFirstName} ${recipientLastName}`,
                order_id: orderId,
                result_url: 'http://localhost/api/user/order/callback',
            })
        ).toString('base64');

        return {
            data,
            signature: OrderModel.createLiqPaySignature(data),
        };
    }

    // signature = base64_encode( sha1( privateKey + data + privateKey ) )
    public static createLiqPaySignature(data: string): string {
        const privateKey: string = process.env.LIQPAY_PRIVATE_KEY!;
        return crypto
            .createHash('sha1')
            .update(privateKey + data + privateKey)
            .digest('base64');
    }

    public static decodeLiqPayData(
        encodedBase64Data: string
    ): CamelCaseProperties<LiqpayDecodedData> {
        return camelCaseObject(
            JSON.parse(base64Decode(encodedBase64Data)) as LiqpayDecodedData
        );
    }

    public async markOrderAsPaid(orderId: number) {
        return this.dbClient.query(
            'UPDATE orders SET is_paid = true WHERE id = $1',
            [orderId]
        );
    }

    public async sendOrderConfirmationEmail(
        // you can either pass all the needed data directly to avoid fetching from the DB
        // or provide the orderId and the function will make a DB call
        orderDetails:
            | { orderId: number }
            | { email: string; phoneNumber: string; orderSummary: OrderSummary }
    ): Promise<void> {
        let email: string, phoneNumber: string, orderSummary: OrderSummary;

        if ('orderId' in orderDetails) {
            const { rows } = await this.dbClient.query<{
                phone_number: string;
                email: string;
                total_price: number;
                order_products: {
                    product_id: number;
                    title: string;
                    order_quantity: number;
                    price: number;
                }[];
            }>(
                formatSqlQuery(`
                    SELECT
                        recipients.phone_number,
                        users.email,
                        (
                            SELECT
                                SUM(orders_products.quantity * products.price)
                            FROM orders_products
                            INNER JOIN products
                                ON products.id = orders_products.product_id
                            WHERE orders_products.order_id = $1
                        ) AS total_price,
                        (
                            SELECT json_agg(t)
                            FROM (
                                SELECT
                                    products.id AS product_id,
                                    products.title,
                                    orders_products.quantity AS order_quantity,
                                    products.price
                                FROM orders_products
                                INNER JOIN products
                                    ON products.id = orders_products.product_id
                                WHERE orders_products.order_id = $1
                            ) AS t
                        ) AS order_products
                    FROM orders
                    INNER JOIN order_recipients AS recipients
                        ON recipients.id = orders.recipient_id
                    INNER JOIN users
                        ON users.id = recipients.associated_user_id
                    WHERE orders.id = $1
                `),
                [orderDetails.orderId]
            );
            const orderInfo = camelCaseObject(rows[0]);
            email = orderInfo.email;
            phoneNumber = orderInfo.phoneNumber;
            orderSummary = {
                orderProducts: orderInfo.orderProducts,
                totalPrice: orderInfo.totalPrice,
            };
        } else {
            // if the user provided all the necessary data, don't fetch anything from the DB
            email = orderDetails.email;
            phoneNumber = orderDetails.phoneNumber;
            orderSummary = orderDetails.orderSummary;
        }

        await sendEmail(
            email,
            '[onlineStore] Замовлення успішно створено',
            `
                <p>Дякуємо за покупку!</p>
                <p>Наш менеджер зателефонує Вам за вказаним номером телефону (${phoneNumber}) для підтвердження замовлення.</p>
                <p>Замовлені товари:</p>
                <ol>
                    ${orderSummary.orderProducts.reduce(
                        (acc, elem) =>
                            acc +
                            `<li>${elem.title} (${
                                elem.orderQuantity
                            } шт., ціна за одиницю - ${formatCurrencyUAH(
                                elem.price
                            )})</li>`,
                        ''
                    )}
                </ol>
                <p>Загальна сума замовлення: <b>${formatCurrencyUAH(
                    orderSummary.totalPrice
                )}</b></p>
            `
        );
    }

    // this function returns 'null' if the provided order ID doesn't exist
    public async isOrderPaidFor(orderId: number): Promise<boolean | null> {
        const { rows, rowCount } = await this.dbClient.query<{
            is_paid: boolean;
        }>(formatSqlQuery(`SELECT is_paid FROM orders WHERE id = $1`), [
            orderId,
        ]);
        return rowCount === 0 ? null : camelCaseObject(rows[0]).isPaid;
    }
}

export default OrderModel;
