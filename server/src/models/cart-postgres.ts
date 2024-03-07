import { PoolClient } from 'pg';

import CartEntry from '../interfaces/CartEntry.js';
import dbPool from '../services/postgres.service.js';
import SnakeCaseProperties from '../interfaces/SnakeCaseProperties.js';
import camelCaseObject from '../util/camelCaseObject.js';
import CartProductSummary from '../interfaces/CartProductSummary.js';
import knex from '../services/knex.service.js';
import formatSqlQuery from '../util/formatSqlQuery.js';

export const getUserCart = async (userId: number): Promise<CartEntry[]> => {
    const { rows } = await dbPool.query<SnakeCaseProperties<CartEntry>>(
        `
            SELECT
                p.id AS product_id,
                p.title,
                p.price,
                p.initial_image_url,
                c.quantity,
                (
                    c.quantity <= p.quantity_in_stock AND
                    c.quantity <= p.max_order_quantity
                ) AS can_be_ordered
            FROM carts AS c
            INNER JOIN products AS p ON c.product_id = p.id
            WHERE c.user_id = $1
        `,
        [userId]
    );

    return rows.map((cartEntry) => {
        return { ...camelCaseObject(cartEntry), price: +cartEntry.price };
    });
};

export const countCartItems = async (
    userId: number,
    // the 'includeDuplicates' parameter decides whether to count duplicate
    // products in the cart. If set to true, duplicates are included; if set
    // to false, only unique products are counted.
    includeDuplicates: boolean
): Promise<number> => {
    let sqlQuery: string;

    if (includeDuplicates) {
        sqlQuery = `
            SELECT
                SUM(quantity)::INTEGER as total_quantity
            FROM carts WHERE user_id = $1
        `;
    } else {
        sqlQuery = `
            SELECT
                COUNT(user_id) as total_quantity
            FROM carts WHERE user_id = $1
        `;
    }

    const {
        rows: [{ total_quantity }],
    } = await dbPool.query<{ total_quantity: number }>(sqlQuery, [userId]);

    return +total_quantity;
};

export const upsertProductToCart = async (
    userId: number,
    productId: number,
    quantity: number
) => {
    const existingCartEntry = await dbPool
        .query(
            `
                SELECT EXISTS(
                    SELECT 1 FROM carts WHERE user_id = $1 AND product_id = $2
                )
            `,
            [userId, productId]
        )
        .then(({ rows }) => rows[0].exists);

    // if the user hasn't added this product before, create a new entry
    if (!existingCartEntry) {
        console.log('this entry does not exist');
        return dbPool.query(
            `
                INSERT INTO carts (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
            `,
            [userId, productId, quantity]
        );
    }

    // if the user has added this product before, then update the quantity
    return dbPool.query(
        `
            UPDATE carts
            SET quantity = $1
            WHERE user_id = $2 AND product_id = $3
        `,
        [quantity, userId, productId]
    );
};

// inserts lots of products into the cart of the provided user
export const bulkInsert = (
    userId: number,
    cartProductsSummary: CartProductSummary[]
) => {
    const sqlQuery = knex('carts')
        .insert(
            cartProductsSummary.map((cartProduct) => ({
                user_id: userId,
                product_id: cartProduct.productId,
                quantity: cartProduct.quantityInCart,
            }))
        )
        .toString();
    return dbPool.query(sqlQuery);
};

export const deleteProductFromCart = (userId: number, productId: number) => {
    return dbPool.query(
        'DELETE FROM carts WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
    );
};

export const cleanCart = (userId: number, dbClient?: PoolClient) => {
    const client = dbClient || dbPool;

    return client.query('DELETE FROM carts WHERE user_id = $1', [userId]);
};

// returns a list of user IDs who have a specific product in their cart
// for example, if 2 users with id 5 and 15 had a product with id 20 in their carts,
// getUsersWithProductInCart(20) would return [5, 15]
export const getUsersWithProductInCart = async (
    productId: number
): Promise<number[]> => {
    const { rows } = await dbPool.query<{ user_id: number }>(
        'SELECT DISTINCT(user_id) FROM carts WHERE product_id = $1',
        [productId]
    );

    return rows.map((row) => row.user_id);
};

// returns the IDs of unique products in the cart
export const getCartProductIDs = async (userId: number): Promise<number[]> => {
    const { rows } = await dbPool.query<{ productId: number }>(
        'SELECT product_id FROM carts WHERE user_id = $1',
        [userId]
    );
    return rows.map((entry) => entry.productId);
};

export const canAtLeastOneCartProductBeOrdered = async (
    userId: number
): Promise<boolean> => {
    const { rows } = await dbPool.query<{
        at_least_one_can_be_ordered: boolean;
    }>(
        formatSqlQuery(`
            SELECT
                COUNT(*) > 0 AS at_least_one_can_be_ordered
            FROM carts
            INNER JOIN products ON products.id = carts.product_id
            WHERE
                user_id = $1
                AND carts.quantity <= products.quantity_in_stock
                AND carts.quantity <= products.max_order_quantity
        `),
        [userId]
    );

    return camelCaseObject(rows[0]).atLeastOneCanBeOrdered;
};

// "getUserIdsWithProductInOrder" returns the user IDs that have at least one item in their cart matching those in the specified order
/* 
    Example:
    Order with the ID 2 contains these products:
    1. productId = 2, quantity = 2
    2. productId = 4, quantity = 3

    User with the ID 52 has these products in the cart:
    1. productId = 2, quantity = 10
    2. productId = 100, quantity = 15
    This user will be included, because this user has productId = 2 in their cart (order with the ID 2 has this product too)

    User with the ID 53 has these products in the cart:
    1. productId = 57, quantity = 10
    2. productId = 189, quantity = 15
    This user will NOT be included, because this user doesn't have any products that the order ID 2 has
*/
export const getUserIdsWithProductInOrder = async (
    orderId: number,
    dbClient?: PoolClient
): Promise<number[]> => {
    const client = dbClient || dbPool;
    const { rows } = await client.query<{ user_id: number }>(
        formatSqlQuery(`
            SELECT user_id
            FROM carts
            WHERE product_id = ANY(
                SELECT product_id
                FROM orders_products
                WHERE order_id = $1
            )
        `),
        [orderId]
    );

    return rows.map((row) => camelCaseObject(row).userId);
};
