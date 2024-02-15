import AnyObject from '../interfaces/AnyObject.js';
import ArrayElement from '../interfaces/ArrayElement.js';
import DBProduct from '../interfaces/DBProduct.js';
import knexInstance from '../services/knex.service.js';
import dbPool from '../services/postgres.service.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import CartEntry from '../interfaces/CartEntry.js';
import formatSqlQuery from '../util/formatSqlQuery.js';
import CartProductSummary from '../interfaces/CartProductSummary.js';
import CheckOrderFeasabilityReqBody from '../interfaces/CheckOrderFeasabilityReqBody.js';

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
        rowCount,
    } = await dbPool.query<Partial<DBProduct>>(sqlQuery);

    if (rowCount === 0) {
        throw new ProductNotFoundError();
    }

    const result: AnyObject = {};

    for (let productField of productFields) {
        result[productField] =
            productField === 'price'
                ? Number(productData[productField])
                : productData[productField];
    }

    return result as Awaited<ReturnType<typeof getProduct<T>>>;
};

// takes product IDs and returns quantity_in_stock and max_order_quantity for them
export const getLimitationsForProducts = async (
    productIds: number[]
): Promise<
    { productId: number; quantityInStock: number; maxOrderQuantity: number }[]
> => {
    const { rows } = await dbPool.query<{
        product_id: number;
        quantity_in_stock: number;
        max_order_quantity: number;
    }>(
        `
            SELECT
                id as product_id,
                quantity_in_stock,
                max_order_quantity
            FROM products
            WHERE id = ANY($1)
        `,
        [productIds]
    );

    return rows.map((row) => ({
        productId: row.product_id,
        quantityInStock: row.quantity_in_stock,
        maxOrderQuantity: row.max_order_quantity,
    }));
};

// creates parameters to prevent SQL injection
const serializeParameters = (productEntriesNum: number): string => {
    let i: number = 0;
    let parameterizedQuery: string = '';

    for (let j = 0; j < productEntriesNum; j++) {
        parameterizedQuery += `($${++i}, $${++i}),`;
    }

    return parameterizedQuery.slice(0, -1);
};

// accepts product IDs, fetches info from the DB, and makes it adhere to the format of cart products
// this function returns an object:
// {
//     productId: {
//         title,
//         price,
//         initialImageUrl,
//         canBeOrdered
//     }
// }
// this output allows to quickly perform lookups
export const getMissingCartProductInfo = async (
    productQuantities: CartProductSummary[]
): Promise<{
    [productId: number]: Omit<CartEntry, 'productId' | 'quantity'>;
}> => {
    const { rows } = await dbPool.query<{
        product_id: number;
        title: string;
        // price will look like this: '25499.00'
        price: string;
        initial_image_url: string;
        can_be_ordered: boolean;
    }>(
        formatSqlQuery(`
            SELECT
                p.id AS product_id,
                p.title,
                p.price,
                p.initial_image_url,
                (
                    c.quantity_in_cart <= p.quantity_in_stock AND
                    c.quantity_in_cart <= p.max_order_quantity
                ) AS can_be_ordered
            FROM products AS p
            INNER JOIN (
                VALUES ${
                    // it's NOT prone to SQL injections because this function doesn't include any user-provided data
                    serializeParameters(productQuantities.length)
                }
            ) AS c(product_id, quantity_in_cart)
                ON c.product_id::INTEGER = p.id;
        `),
        productQuantities
            .map((productQuantity) => [
                productQuantity.productId,
                productQuantity.quantityInCart,
            ])
            .flat()
    );

    const lookupObj: Awaited<ReturnType<typeof getMissingCartProductInfo>> = {};

    rows.forEach((row) => {
        lookupObj[row.product_id] = {
            title: row.title,
            price: +row.price,
            initialImageUrl: row.initial_image_url,
            canBeOrdered: row.can_be_ordered,
        };
    });

    return lookupObj;
};

export const productExists = async (productId: number): Promise<boolean> => {
    const { rowCount } = await dbPool.query(
        'SELECT 1 FROM products WHERE id = $1',
        [productId]
    );

    return rowCount > 0;
};

// returns 'true' if all the provided products exist
// if at least one product doesn't exist, returns 'false'
export const productsExist = async (productIDs: number[]): Promise<boolean> => {
    const { rowCount } = await dbPool.query(
        `
            SELECT 1
            FROM products
            WHERE id = ANY($1)
        `,
        [productIDs]
    );

    return rowCount === productIDs.length;
};

export const canProductsBeOrdered = async (
    productEntries: CheckOrderFeasabilityReqBody
): Promise<{
    [productId: number]: { canBeOrdered: boolean };
}> => {
    const rows = await dbPool
        .query<{
            product_id: number;
            can_be_ordered: boolean;
        }>(
            formatSqlQuery(`
                SELECT
                    c.product_id,
                    (
                        c.quantity_in_cart::INTEGER <= p.quantity_in_stock
                        AND c.quantity_in_cart::INTEGER <= p.max_order_quantity
                    ) AS can_be_ordered
                FROM (
                    VALUES ${
                        // it's NOT prone to SQL injections because this function doesn't include any user-provided data
                        serializeParameters(productEntries.length)
                    }
                ) AS c(product_id, quantity_in_cart)
                INNER JOIN products AS p
                    ON p.id = c.product_id::INTEGER;
            `),
            productEntries
                .map((productQuantity) => [
                    productQuantity.productId,
                    productQuantity.quantity,
                ])
                .flat()
        )
        .then(({ rows }) =>
            rows.map((row) => ({
                productId: row.product_id,
                canBeOrdered: row.can_be_ordered,
            }))
        );

    const result: Awaited<ReturnType<typeof canProductsBeOrdered>> = {};

    rows.forEach((row) => {
        result[row.productId] = { canBeOrdered: row.canBeOrdered };
    });

    return result;
};
