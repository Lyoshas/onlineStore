import { PoolClient } from 'pg';

import CartEntry from '../interfaces/CartEntry.js';
import dbPool from '../services/postgres.service.js';
import SnakeCaseProperties from '../interfaces/SnakeCaseProperties.js';
import camelCaseObject from '../util/camelCaseObject.js';
import CartProductSummary from '../interfaces/CartProductSummary.js';
import knex from '../services/knex.service.js';

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
    const sqlQuery = knex('carts').insert(
        cartProductsSummary.map((cartProduct) => ({
            user_id: userId,
            product_id: cartProduct.productId,
            quantity: cartProduct.quantityInCart,
        }))
    ).toString();
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

export const isProductInTheCart = async (
    userId: number,
    productId: number
): Promise<boolean> => {
    const { rowCount } = await dbPool.query(
        'SELECT 1 FROM carts WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
    );

    return rowCount > 0;
};

// returns the IDs of unique products in the cart
export const getCartProductIDs = async (userId: number): Promise<number[]> => {
    const { rows } = await dbPool.query<{ productId: number }>(
        'SELECT product_id FROM carts WHERE user_id = $1',
        [userId]
    );
    return rows.map((entry) => entry.productId);
};
