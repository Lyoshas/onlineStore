import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

import dbPool from '../../services/postgres.service.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import DBProduct from '../../interfaces/DBProduct.js';
import getRelevantProductFields from '../helpers/getRelevantProductFields.js';
import knexInstance from '../../services/knex.service.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';

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
    const requestedFieldsList = Object.keys(
        requestedFields
    ) as (keyof PossibleGraphQLFields)[];

    const sqlQuery: string = knexInstance('products')
        .select(getRelevantProductFields(requestedFieldsList))
        .orderByRaw('RANDOM()')
        .limit(12)
        .toString();

    const { rows } = await dbPool.query<
        Partial<Omit<DBProduct, 'max_order_quantity'>>
    >(sqlQuery);

    return rows.map((product) =>
        mapRequestedFieldsToProductInfo(product, requestedFieldsList)
    ) as GetFeaturedProductsOutput;
}

export default getFeaturedProducts;
