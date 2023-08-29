import dbPool from '../services/postgres.service.js';

export const getProductQuantity = async (
    productId: number
): Promise<number> => {
    const { rows } = await dbPool.query<{ quantity_in_stock: number }>(
        'SELECT quantity_in_stock FROM products WHERE id = $1',
        [productId]
    );

    return rows[0].quantity_in_stock;
};
