import dbPool from '../util/database';
import CartEntry from '../interfaces/CartEntry';

export const getUserCart = (userId: number): Promise<CartEntry[]> => {
    return dbPool.query(
        `
        SELECT
            p.id AS product_id,
            p.title,
            p.price,
            p.preview_url,
            c.quantity
        FROM carts AS c
        INNER JOIN products AS p ON c.product_id = p.id
        `
    )
        .then(({ rows }) => rows);
};

export const addProductToCart = async (
    userId: number,
    productId: number,
    quantity: number
) => {
    const existingCartEntry = await dbPool.query(
        `
        SELECT EXISTS(
            SELECT 1 FROM carts WHERE user_id = $1 AND product_id = $2 
        )
        `,
        [userId, productId]
    ).then(({ rows }) => rows[0].exists);

    // if there are no entries with this product
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

    // if there are entries, update the quantity
    return dbPool.query(
        `
            UPDATE carts
            SET quantity = $1
            WHERE user_id = $2 AND product_id = $3
        `,
        [quantity, userId, productId]
    );
};

export const deleteProductFromCart = (
    userId: number,
    productId: number
) => {
    return dbPool.query(
        'DELETE FROM carts WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
    );
};

export const cleanCart = (userId: number) => {
    return dbPool.query('DELETE FROM carts WHERE user_id = $1', [userId]);
};
