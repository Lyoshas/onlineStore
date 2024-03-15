import { GraphQLResolveInfo } from 'graphql';
import { Knex } from 'knex';
import graphqlFields from 'graphql-fields';

import DisplayProduct from '../../interfaces/DisplayProduct.js';
import getRelevantProductFields from '../helpers/getRelevantProductFields.js';
import knex from '../../services/knex.service.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import { IsInTheCartAuthError } from '../errors/IsInTheCartAuthError.js';
import dbPool from '../../services/postgres.service.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';
import formatSqlQuery from '../../util/formatSqlQuery.js';
import getUserRatingSubquery from '../helpers/getUserRatingSubquery.js';

type GetFeaturedProductsOutput = Partial<DisplayProduct>[];

type PossibleGraphQLFields = {
    [productField in keyof DisplayProduct]?: {};
}

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
    const shouldGetUserRating: boolean = 'userRating' in requestedFields;

    if (shouldGetIsInTheCart && context.user === null) {
        throw new IsInTheCartAuthError();
    }

    const requestedFieldsList = Object.keys(
        requestedFields
    ) as (keyof PossibleGraphQLFields)[];

    // full query that this resolver makes
    // (it can be smaller if the user provided less fields; this is why this query is constructed dynamically)
    /*
        SELECT
            "products"."id",
            "products"."title",
            "products"."price",
            "product_categories"."category",
            "products"."initial_image_url",
            "products"."additional_image_url",
            "products"."short_description",
            "products"."quantity_in_stock",
            CASE
                WHEN relevant_cart_entries.product_id IS NOT NULL
                THEN true
                ELSE false
            END AS is_in_the_cart,
            (
                SELECT (ROUND(AVG(star_rating) * 2) / 2)::DECIMAL(3, 2)
                FROM "product_reviews"
                INNER JOIN "review_moderation_statuses"
                    ON "review_moderation_statuses"."id" = "product_reviews"."moderation_status_id"
                WHERE "product_id" = products.id AND "review_moderation_statuses"."name" = 'approved'
            ) AS "user_rating"
        FROM "products"
        INNER JOIN "product_categories"
            ON "product_categories"."id" = "products"."category_id"
        LEFT JOIN (
            SELECT "product_id"
            FROM "carts"
            WHERE "user_id" = 750
        ) AS "relevant_cart_entries"
            ON "products"."id" = "relevant_cart_entries"."product_id"
        WHERE "quantity_in_stock" > 0
        ORDER BY RANDOM()
        LIMIT 12;
    */

    const fieldsToFetch: (string | Knex.Raw | Knex.QueryBuilder)[] =
        getRelevantProductFields(requestedFieldsList);

    if (shouldGetIsInTheCart) {
        fieldsToFetch.push(
            knex.raw(
                formatSqlQuery(`
                    CASE
                        WHEN relevant_cart_entries.product_id IS NOT NULL THEN true
                        ELSE false
                    END AS is_in_the_cart
                `)
            )
        );
    }

    if (shouldGetUserRating) {
        // calculating the user rating of each selected product with a correlated subquery
        fieldsToFetch.push(getUserRatingSubquery(knex.raw('products.id')));
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
