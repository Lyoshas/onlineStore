import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { Knex } from 'knex';

import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import dbPool from '../../services/postgres.service.js';
import getRelevantProductFields, {
    GetRelevantProductFieldsInput,
} from '../helpers/getRelevantProductFields.js';
import knex from '../../services/knex.service.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';
import { IsInTheCartError } from '../errors/IsInTheCartError.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import camelCaseToSnakeCase from '../helpers/camelCaseToSnakeCase.js';
import camelCaseObject from '../../util/camelCaseObject.js';

// type GetProductOutput = Partial<DisplayProduct>;

interface ProductReview {
    userId: number;
    fullName: string;
    reviewMessage: string;
    starRating: number;
    createdAt: string;
}

interface GetProductOutput {
    id?: number;
    title?: string;
    price?: number;
    category?: string;
    initialImageUrl?: string;
    additionalImageUrl?: string;
    shortDescription?: string;
    isInTheCart?: boolean;
    isAvailable?: boolean;
    isRunningOut?: boolean;
    reviews?: Partial<ProductReview>[];
}

type PossibleGraphQLFields = {
    [prop in keyof GetProductOutput]: {};
} & {
    reviews?: {
        [prop in keyof ProductReview]?: {};
    };
};

async function getProduct(
    parent: any,
    args: { id: number },
    context: ApolloServerContext,
    resolveInfo: GraphQLResolveInfo
): Promise<GetProductOutput> {
    const requestedFields = graphqlFields(resolveInfo) as PossibleGraphQLFields;
    const requestedFieldsList = Object.keys(
        requestedFields
    ) as (keyof PossibleGraphQLFields)[];

    const productId: number = args.id;

    const shouldGetIsInTheCart: boolean = 'isInTheCart' in requestedFields;

    if (shouldGetIsInTheCart && context.user === null) {
        throw new IsInTheCartError();
    }

    const userId: number | null = context.user && context.user.id;

    // now we're going to build a SQL query depending on what the user requested
    // an example query what selects everything except product reviews:
    /*
        SELECT
            products.id, title, price,
            category, initial_image_url, additional_image_url,
            short_description, quantity_in_stock,
            (
                SELECT COUNT(*)::int::boolean
                FROM carts WHERE user_id = 601 AND product_id = 635
            ) AS is_in_the_cart
        FROM products
        INNER JOIN product_categories ON product_categories.id = products.category_id
        WHERE products.id = 635;
    */

    const columnsToSelect: (string | Knex.QueryBuilder)[] = [
        ...getRelevantProductFields(
            requestedFieldsList as GetRelevantProductFieldsInput
        ),
    ];

    if (shouldGetIsInTheCart) {
        // this is not prone to SQL injections,
        // because this query is not using user data
        columnsToSelect.push(
            knex
                .select(knex.raw('COUNT(*)::INT::BOOLEAN'))
                .from('carts')
                .where('user_id', '=', userId!)
                .andWhere('product_id', '=', productId)
                .as('is_in_the_cart')
        );
    }

    let queryBuilder = knex.select(columnsToSelect).from('products');

    if ('category' in requestedFields) {
        queryBuilder = queryBuilder.innerJoin(
            'product_categories',
            'product_categories.id',
            '=',
            'products.category_id'
        );
    }

    queryBuilder = queryBuilder.where({ 'products.id': productId });

    const {
        rows: [dbProductInfo],
        rowCount,
    } = await dbPool.query(queryBuilder.toQuery());

    if (rowCount === 0) {
        throw new ProductNotFoundError();
    }

    // mapping everything except 'reviews', we'll do it later
    const resultProductInfo = mapRequestedFieldsToProductInfo(
        dbProductInfo,
        requestedFieldsList.filter(
            (requestedField) => requestedField !== 'reviews'
        ) as Exclude<(typeof requestedFieldsList)[0], 'reviews'>[]
    ) as GetProductOutput;

    // if the user requested product reviews, fetch it from the DB
    if (requestedFields['reviews']) {
        // now we're going to build a SQL query depending on what the user requested
        // an example query what selects product reviews:
        /*
            SELECT
                user_id,
                CONCAT(first_name, ' ', last_name) AS full_name,
                review_message,
                star_rating,
                product_reviews.created_at
            FROM product_reviews
            INNER JOIN moderation_statuses
                ON moderation_statuses.id = product_reviews.moderation_status_id
            INNER JOIN users
                ON users.id = product_reviews.user_id
            WHERE
                product_reviews.product_id = 635
                AND moderation_statuses.name = 'approved'
            ORDER BY created_at DESC
        */

        const requestedReviewFields = requestedFields['reviews'];
        const dbFields: (string | Knex.Raw)[] = Object.keys(
            requestedReviewFields
        )
            .map((field) => {
                const snakeCaseField = camelCaseToSnakeCase(field);
                return snakeCaseField === 'full_name'
                    ? knex.raw(
                          "CONCAT(first_name, ' ', last_name) AS full_name"
                      )
                    : snakeCaseField === 'created_at'
                    ? 'product_reviews.created_at'
                    : snakeCaseField;
            })
            // removing the '__typename' field, because PostgreSQL doesn't understand it
            .filter((field) => field !== '__typename');

        // selecting only approved product reviews (latest reviews first)
        let queryBuilder = knex
            .select(dbFields)
            .from('product_reviews')
            .innerJoin(
                'moderation_statuses',
                'moderation_statuses.id',
                '=',
                'product_reviews.moderation_status_id'
            );

        if ('fullName' in requestedReviewFields) {
            queryBuilder = queryBuilder.innerJoin(
                'users',
                'users.id',
                '=',
                'product_reviews.user_id'
            );
        }

        queryBuilder = queryBuilder
            .where('product_reviews.product_id', '=', productId)
            .andWhere('moderation_statuses.name', '=', 'approved')
            .orderBy('product_reviews.created_at', 'desc');

        // technically, it's possible to combine 2 queries into one,
        // but in this case the code will be much harder to maintain
        const { rows: reviews } = await dbPool.query<{
            user_id?: number;
            review_message?: string;
            star_rating?: number;
            created_at?: Date;
        }>(queryBuilder.toQuery());

        resultProductInfo['reviews'] = reviews.map((review) => ({
            ...camelCaseObject(review),
            // transforming the date into this format: DD.MM.YYYY
            createdAt: review.created_at
                ? review.created_at.toLocaleDateString('uk-UA')
                : void 0,
        }));
    }

    return resultProductInfo;
}

export default getProduct;
