import AnyObject from '../interfaces/AnyObject.js';
import ArrayElement from '../interfaces/ArrayElement.js';
import DBProduct from '../interfaces/DBProduct.js';
import knexInstance from '../services/knex.service.js';
import dbPool from '../services/postgres.service.js';
import { getUserCart as getRedisUserCart } from './cartRedis.js';

export type PossibleProductFields = (keyof DBProduct)[];

// TypeScript example:
// const product = await getProduct(productId, ['title', 'price', 'initial_image_url'])
// Type of the "product" variable:
// {
//     title: string;
//     price: number;
//     initial_image_url: string;
// }
export const getProduct = async <T extends PossibleProductFields>(
    productId: number,
    productFields: T
): Promise<{ [key in ArrayElement<T>]: DBProduct[key] }> => {
    const sqlQuery = knexInstance('products')
        .select(productFields)
        .where({ id: productId })
        .toString();

    const {
        rows: [productData],
    } = await dbPool.query<Partial<DBProduct>>(sqlQuery);

    const result: AnyObject = {};

    for (let productField of productFields) {
        result[productField] =
            productField === 'price'
                ? Number(productData[productField])
                : productData[productField];
    }

    return result as Awaited<ReturnType<typeof getProduct<T>>>;
};

// this function should only be used if you want to check one product
// if there is more than 1 product, other strategies should be used
// otherwise PostgreSQL can potentially be overwhelmed with requests
export const isProductInTheCart = async (
    userId: number,
    productId: number
): Promise<boolean> => {
    const cart = await getRedisUserCart(userId);

    if (cart) {
        for (let cartEntry of cart) {
            if (cartEntry.productId === productId) return true;
        }
    }

    const { rowCount } = await dbPool.query(
        'SELECT 1 FROM carts WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
    );

    return rowCount > 0;
};
