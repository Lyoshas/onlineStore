import { GraphQLResolveInfo } from 'graphql';
import { Knex } from 'knex';
import graphqlFields from 'graphql-fields';

import DisplayProduct from '../../interfaces/DisplayProduct.js';
import getRelevantProductFields from '../helpers/getRelevantProductFields.js';
import knex from '../../services/knex.service.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import { IsInTheCartError } from '../errors/IsInTheCartError.js';
import dbPool from '../../services/postgres.service.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';
import formatSqlQuery from '../../util/formatSqlQuery.js';

type GetFeaturedProductsOutput = Partial<DisplayProduct>[];

type PossibleGraphQLFields = {
    [productField in keyof DisplayProduct]?: {};
};

// this function should get featured (or most popular) products,
// but for now we're going to only get 12 random products
async function getFeaturedProducts(
    parent: any,
    args: void,
    context: ApolloServerContext,
    resolveInfo: GraphQLResolveInfo
): Promise<GetFeaturedProductsOutput> {
    const requestedFields = graphqlFields(resolveInfo) as PossibleGraphQLFields;

    const shouldGetIsInTheCart: boolean = 'isInTheCart' in requestedFields;

    if (shouldGetIsInTheCart && context.user === null) {
        throw new IsInTheCartError();
    }

    const requestedFieldsList = Object.keys(
        requestedFields
    ) as (keyof PossibleGraphQLFields)[];

    const fieldsToFetch: (string | Knex.Raw)[] =
        getRelevantProductFields(requestedFieldsList);

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

    if ('category' in requestedFields) {
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
        .orderByRaw('RANDOM()')
        .where('quantity_in_stock', '>', 0)
        .limit(12);

    const sqlQuery: string = formatSqlQuery(queryBuilder.toString());
    console.log(sqlQuery);

    const { rows: products } = await dbPool.query(sqlQuery);

    return products.map((dbProduct) =>
        mapRequestedFieldsToProductInfo(dbProduct, requestedFieldsList)
    ) as GetFeaturedProductsOutput;
}

export default getFeaturedProducts;
