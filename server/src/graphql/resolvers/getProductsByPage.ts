import { GraphQLResolveInfo } from 'graphql';
import { Knex } from 'knex';
import graphqlFields from 'graphql-fields';

import DisplayProduct from '../../interfaces/DisplayProduct.js';
import dbPool from '../../services/postgres.service.js';
import { PageOutOfRangeError } from '../errors/PageOutOfRangeError.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import knex from '../../services/knex.service.js';
import getRelevantProductFields from '../helpers/getRelevantProductFields.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';
import RequireAtLeastOneProperty from '../../interfaces/RequireAtLeastOneProperty.js';
import { IsInTheCartError } from '../errors/IsInTheCartError.js';
import formatSqlQuery from '../helpers/formatSqlQuery.js';

type GetProductsByPageOutput = RequireAtLeastOneProperty<{
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

async function getTotalPages(productsPerPage: number): Promise<number> {
    const { rows } = await dbPool.query<{ total_products: number }>(
        'SELECT COUNT(id) AS total_products FROM products'
    );
    return Math.ceil(rows[0].total_products / productsPerPage);
}

async function getProductsByPage(
    parent: any,
    args: { page: number },
    context: ApolloServerContext,
    resolveInfo: GraphQLResolveInfo
): Promise<GetProductsByPageOutput> {
    const requestedFields = graphqlFields(
        resolveInfo
    ) as PossibleGraphQLFields;

    const shouldGetIsInTheCart: boolean =
        !!requestedFields.productList &&
        'isInTheCart' in requestedFields.productList;

    if (shouldGetIsInTheCart && context.user === null) {
        throw new IsInTheCartError();
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
        GetProductsByPageOutput['productList'],
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

        if ('category' in requestedFields.productList) {
            queryBuilder = queryBuilder.innerJoin(
                'product_categories',
                'product_categories.id',
                '=',
                'products.category_id'
            );
        }

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

    const resultData: GetProductsByPageOutput = {
        productList: resultProductList,
    };

    if ('totalPages' in requestedFields) {
        resultData.totalPages = await getTotalPages(productsPerPage);
    }

    return resultData;
}

export default getProductsByPage;
