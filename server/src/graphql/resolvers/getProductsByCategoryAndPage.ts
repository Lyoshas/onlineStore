import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { Knex } from 'knex';

import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import RequireAtLeastOneProperty from '../../interfaces/RequireAtLeastOneProperty.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import dbPool from '../../services/postgres.service.js';
import { IsInTheCartAuthError } from '../errors/IsInTheCartAuthError.js';
import { PageOutOfRangeError } from '../errors/PageOutOfRangeError.js';
import getRelevantProductFields from '../helpers/getRelevantProductFields.js';
import knex from '../../services/knex.service.js';
import formatSqlQuery from '../../util/formatSqlQuery.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';
import checkProductCategory from '../validators/checkProductCategory.js';

type GetProductsByCategoryAndPageOutput = RequireAtLeastOneProperty<{
    productList: Partial<DisplayProduct>[];
    totalPages: number;
}>;

type ProductInfo = {
    [productField in keyof DisplayProduct]: {};
};

interface PossibleGraphQLFields {
    productList?: Partial<ProductInfo>;
    totalPages?: {};
}

async function getTotalPages(
    productsPerPage: number,
    productCategory: string
): Promise<number> {
    const { rows } = await dbPool.query<{ total_products: number }>(
        `
            SELECT COUNT(*) AS total_products
            FROM products AS p
            INNER JOIN product_categories AS p_c ON p.category_id = p_c.id
            WHERE p_c.category = $1
        `,
        [productCategory]
    );
    return Math.ceil(rows[0].total_products / productsPerPage);
}

async function getProductsByCategoryAndPage(
    parent: unknown,
    args: { category: string; page: number },
    context: ApolloServerContext,
    resolveInfo: GraphQLResolveInfo
): Promise<GetProductsByCategoryAndPageOutput> {
    await checkProductCategory(args.category);

    const requestedFields = graphqlFields(resolveInfo) as PossibleGraphQLFields;

    const shouldGetIsInTheCart: boolean =
        !!requestedFields.productList &&
        'isInTheCart' in requestedFields.productList;

    if (shouldGetIsInTheCart && context.user === null) {
        throw new IsInTheCartAuthError();
    } else if (shouldGetIsInTheCart) {
        // we need to request the id of each product if the user requested the "isInTheCart" field
        requestedFields.productList!.id = {};
    }

    if (args.page <= 0) {
        throw new PageOutOfRangeError();
    }

    const productsPerPage: number = parseInt(
        process.env.PRODUCTS_PER_PAGE as string
    );

    const resultProductList: Exclude<
        GetProductsByCategoryAndPageOutput['productList'],
        undefined
    > = [];

    if (requestedFields.productList) {
        const requestedFieldsList = Object.keys(
            requestedFields.productList
        ) as (keyof Exclude<PossibleGraphQLFields['productList'], undefined>)[];
        const fieldsToFetch: (string | Knex.Raw)[] = [
            ...getRelevantProductFields(requestedFieldsList),
        ];

        if (shouldGetIsInTheCart) {
            fieldsToFetch.push(
                knex.raw(`
                    CASE
                        WHEN relevant_cart_entries.product_id IS NOT NULL THEN true
                        ELSE false
                    END AS is_in_the_cart
                `)
            );
        }

        let queryBuilder = knex.select(fieldsToFetch).from('products');

        queryBuilder = queryBuilder.innerJoin(
            'product_categories',
            'product_categories.id',
            '=',
            'products.category_id'
        );

        if (shouldGetIsInTheCart) {
            queryBuilder = queryBuilder.leftJoin(
                knex
                    .select('product_id')
                    .from('carts')
                    .where({ user_id: context.user!.id })
                    .as('relevant_cart_entries'),
                'products.id',
                '=',
                'relevant_cart_entries.product_id'
            );
        }

        queryBuilder = queryBuilder.where(
            'product_categories.category',
            '=',
            args.category
        );

        queryBuilder = queryBuilder
            // PostgreSQL doesn't guarantee the order of rows when using JOINs, so we need to order them by product id
            .orderBy('products.id')
            .offset(productsPerPage * (+args.page - 1))
            .limit(productsPerPage);

        const sqlQuery: string = formatSqlQuery(queryBuilder.toString());

        console.log(sqlQuery);

        const { rows: products } = await dbPool.query(sqlQuery);

        resultProductList.push(
            ...(products.map((product) => {
                return mapRequestedFieldsToProductInfo(
                    product,
                    requestedFieldsList
                );
            }) as typeof resultProductList)
        );
    }

    const resultData: GetProductsByCategoryAndPageOutput = {
        productList: resultProductList,
    };

    if ('totalPages' in requestedFields) {
        resultData.totalPages = await getTotalPages(
            productsPerPage,
            args.category
        );
    }

    return resultData;
}

export default getProductsByCategoryAndPage;
