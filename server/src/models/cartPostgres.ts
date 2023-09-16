import { PoolClient } from 'pg';

import CartEntry from '../interfaces/CartEntry.js';
import dbPool from '../services/postgres.service.js';
import SnakeCaseProperties from '../interfaces/SnakeCaseProperties.js';
import camelCaseObject from '../util/camelCaseObject.js';

export const getUserCart = async (userId: number): Promise<CartEntry[]> => {
    const { rows } = await dbPool.query<SnakeCaseProperties<CartEntry>>(
        `
            SELECT
                p.id AS product_id,
                p.title,
                p.price,
                p.initial_image_url,
                c.quantity
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

export const countCartItems = async (userId: number): Promise<number> => {
    const {
        rows: [{ total_quantity }],
    } = await dbPool.query<{ total_quantity: number }>(
        `
            SELECT
                SUM(quantity)::INTEGER as total_quantity
            FROM carts WHERE user_id = $1
        `,
        [userId]
    );

    return +total_quantity;
};

export const addProductToCart = async (
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
