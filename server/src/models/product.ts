import AnyObject from '../interfaces/AnyObject.js';
import ArrayElement from '../interfaces/ArrayElement.js';
import DBProduct from '../interfaces/DBProduct.js';
import knexInstance from '../services/knex.service.js';
import dbPool from '../services/postgres.service.js';

type PossibleProductFields = (keyof DBProduct)[];

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
        result[productField] = productData[productField];
    }

    return result as Awaited<ReturnType<typeof getProduct<T>>>;
};
