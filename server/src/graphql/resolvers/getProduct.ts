import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import dbPool from '../../services/postgres.service.js';
import getRelevantProductFields, {
    GetRelevantProductFieldsInput,
} from '../helpers/getRelevantProductFields.js';
import knex from '../../services/knex.service.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';
import { IsInTheCartError } from '../errors/IsInTheCartError.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import formatSqlQuery from '../../util/formatSqlQuery.js';

type GetProductOutput = Partial<DisplayProduct>;

interface PossibleGraphQLFields {
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
}

async function getProduct(
    parent: any,
    args: { id: number },
    context: ApolloServerContext,
    resolveInfo: GraphQLResolveInfo
): Promise<GetProductOutput> {
    const requestedFields = graphqlFields(resolveInfo) as {
        [prop in keyof PossibleGraphQLFields]: {};
    };
    const requestedFieldsList = Object.keys(
        requestedFields
    ) as (keyof PossibleGraphQLFields)[];

    const productId: number = args.id;

    const shouldGetIsInTheCart: boolean = 'isInTheCart' in requestedFields;

    if (shouldGetIsInTheCart && context.user === null) {
        throw new IsInTheCartError();
    }

    const columnsToSelect = [
        ...getRelevantProductFields(
            requestedFieldsList as GetRelevantProductFieldsInput
        ),
    ];

    if (shouldGetIsInTheCart) {
        columnsToSelect.push('additional_info.is_in_the_cart');
    }

    let queryBuilder = knex.select(columnsToSelect).from('products');

    if ('category' in requestedFields) {
        queryBuilder = queryBuilder.innerJoin(
            'product_categories',
            'products.category_id',
            '=',
            'product_categories.id'
        );
    }

    if (shouldGetIsInTheCart) {
        queryBuilder = queryBuilder.crossJoin(
            knex.raw(
                `
                (
                    SELECT
                        count(*)::INT::BOOLEAN AS is_in_the_cart
                    FROM carts
                    WHERE user_id = ? AND product_id = ?
                ) AS additional_info
            `,
                [context.user!.id, productId]
            )
        );
    }

    queryBuilder = queryBuilder.where({ 'products.id': productId });

    const sqlQuery: string = formatSqlQuery(queryBuilder.toString());

    console.log(sqlQuery);

    const {
        rows: [productInfo],
        rowCount,
    } = await dbPool.query(sqlQuery);

    if (rowCount === 0) {
        throw new ProductNotFoundError();
    }

    return mapRequestedFieldsToProductInfo(
        productInfo,
        requestedFieldsList
    ) as GetProductOutput;
}

export default getProduct;
