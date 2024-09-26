import { PoolClient } from 'pg';
import { Knex } from 'knex';

import AnyObject from '../interfaces/AnyObject.js';
import ArrayElement from '../interfaces/ArrayElement.js';
import DBProduct from '../interfaces/DBProduct.js';
import knex from '../services/knex.service.js';
import dbPool from '../services/postgres.service.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import CartEntry from '../interfaces/CartEntry.js';
import formatSqlQuery from '../util/formatSqlQuery.js';
import CartProductSummary from '../interfaces/CartProductSummary.js';
import CheckOrderFeasabilityReqBody from '../interfaces/CheckOrderFeasabilityReqBody.js';
import serializeSqlParameters from '../util/serializeSqlParameters.js';
import osearchClient from '../services/opensearch.service.js';
import getUserRatingSubquery from '../graphql/helpers/getUserRatingSubquery.js';
import camelCaseObject from '../util/camelCaseObject.js';
import isProductAvailable from '../graphql/helpers/isProductAvailable.js';
import isProductRunningOut from '../graphql/helpers/isProductRunningOut.js';
import {
    QueryDslQueryContainer,
    SearchHitsMetadata,
    SearchTemplateResponse,
    SearchTotalHits,
} from '@opensearch-project/opensearch/api/types.js';
import { ResponseError } from '@opensearch-project/opensearch/lib/errors.js';
import { ApiResponse } from '@opensearch-project/opensearch/.';

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
    const sqlQuery = knex('products')
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
    console.log(productQuantities);
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
                    c.quantity_in_cart::INTEGER <= p.quantity_in_stock AND
                    c.quantity_in_cart::INTEGER <= p.max_order_quantity
                ) AS can_be_ordered
            FROM products AS p
            INNER JOIN (
                VALUES ${
                    // it's NOT prone to SQL injections because this function doesn't include any user-provided data
                    serializeSqlParameters(productQuantities.length, 2)
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
                        serializeSqlParameters(productEntries.length, 2)
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

// this function is used to decrease the stock of multiple products
// this is used after creating an order
export const decreaseProductsStock = async (
    products: { productId: number; quantity: number }[],
    dbClient?: PoolClient
): Promise<void> => {
    const client = dbClient || dbPool;
    await client.query(
        formatSqlQuery(`
            UPDATE products
            SET quantity_in_stock = quantity_in_stock - c.quantity::INTEGER
            FROM (
                VALUES ${
                    // it's NOT prone to SQL injections because this function doesn't include any user-provided data
                    serializeSqlParameters(products.length, 2)
                }
            ) AS c(product_id, quantity)
            WHERE c.product_id::INTEGER = products.id
        `),
        products.map((product) => [product.productId, product.quantity]).flat()
    );
};

// This function is responsible for reverting the deduction of product
// stocks from the database when an order is canceled due to payment
// cancellation. It should be called whenever an order cancellation
// occurs to ensure that the product stocks are returned to their original
// quantities, maintaining accurate inventory levels
export const restoreProductStocks = async (
    orderId: number,
    dbClient?: PoolClient
): Promise<void> => {
    const client = dbClient || dbPool;

    await client.query(
        formatSqlQuery(`
            UPDATE products
            SET quantity_in_stock = quantity_in_stock + c.ordered_quantity
            FROM (
                SELECT product_id, quantity AS ordered_quantity
                FROM orders_products
                WHERE order_id = $1
            ) AS c(product_id, ordered_quantity)
            WHERE c.product_id = products.id;
        `),
        [orderId]
    );
};

export const getProductIDsBySearchQuery = async (
    searchQuery: string,
    page: number
): Promise<{ productIDs: number[]; totalHits: number }> => {
    const productsPerPage: number = +process.env.PRODUCTS_PER_PAGE!;
    const queryOptions: { query: QueryDslQueryContainer } = {
        query: {
            multi_match: {
                query: searchQuery,
                fields: ['title^3', 'category^2', 'shortDescription'],
                fuzziness: 2, // edit distance of 2 (2 typos are allowed)
            },
        },
    };

    try {
        const response = await osearchClient.search<
            SearchTemplateResponse<{
                productId: number;
                title: string;
                category: string;
                shortDescription: string;
            }>
        >({
            index: 'products',
            body: queryOptions,
            from: productsPerPage * (page - 1),
            size: productsPerPage,
        });

        if (response.statusCode !== 200) {
            throw new Error(
                'OpenSearch replied with the status code other than 200'
            );
        }

        return {
            productIDs: response.body.hits.hits.map(
                (searchHit) => searchHit._source!.productId
            ),
            totalHits: (response.body.hits.total as SearchTotalHits).value,
        };
    } catch (e) {
        if (
            e instanceof ResponseError &&
            e.message.includes('Result window is too large')
        ) {
            // by default, OpenSearch allows (from + size) to be up to 10,000
            // if the user specifies more than that, we will return an empty product array and return the total number of pages
            // this is suitable for this application because it will probably never have that many products
            const response = await osearchClient.search<SearchTemplateResponse>(
                {
                    index: 'products',
                    // we don't want to return any documents, we just want to count them
                    size: 0,
                    body: queryOptions,
                }
            );
            return {
                productIDs: [],
                totalHits: (response.body.hits.total as SearchTotalHits).value,
            };
        }
        throw e;
    }
};

export const getProductsByIDs = async (
    productIDs: number[],
    // if "userId" is NOT 'null', this function will include the 'isInTheCart' field
    userId: number | null
): Promise<
    {
        id: number;
        title: string;
        price: number;
        category: string;
        userRating: number | null;
        initialImageUrl: string;
        additionalImageUrl: string;
        shortDescription: string;
        isAvailable: boolean;
        isRunningOut: boolean;
        isInTheCart?: boolean;
    }[]
> => {
    const fieldsToSelect: (string | Knex.Raw | Knex.QueryBuilder)[] = [
        'products.id',
        'title',
        'price',
        'initial_image_url',
        'additional_image_url',
        'short_description',
        'quantity_in_stock',
        'product_categories.category',
        getUserRatingSubquery(knex.raw('products.id')),
    ];

    if (userId !== null) {
        fieldsToSelect.push(
            knex.raw(
                formatSqlQuery(`
                    (
                        SELECT EXISTS(
                            SELECT 1
                            FROM carts
                            WHERE user_id = ? AND product_id = products.id
                        )
                    ) AS is_in_the_cart
                `),
                [userId]
            )
        );
    }

    let query = knex
        .select(fieldsToSelect)
        .from('products')
        .innerJoin(
            'product_categories',
            'product_categories.id',
            '=',
            'products.category_id'
        )
        .where(knex.raw('products.id = ANY(?)', [productIDs]));

    const sqlQuery = query.toQuery();

    const { rows } = await dbPool.query<{
        id: number;
        title: string;
        price: string;
        initial_image_url: string;
        additional_image_url: string;
        short_description: string;
        quantity_in_stock: number;
        category: string;
        user_rating: string;
        is_in_the_cart?: boolean;
    }>(sqlQuery);

    return rows.map((row) => {
        const { quantityInStock, price, userRating, ...productSummary } =
            camelCaseObject(row);
        return {
            ...productSummary,
            userRating: userRating !== null ? +userRating : null,
            price: +price,
            isAvailable: isProductAvailable(quantityInStock),
            isRunningOut: isProductRunningOut(quantityInStock),
        };
    });
};
