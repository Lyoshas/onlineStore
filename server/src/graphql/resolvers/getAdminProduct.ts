import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import DBProduct from '../../interfaces/DBProduct.js';
import validateUser from '../validators/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import CamelCaseProperties from '../../interfaces/CamelCaseProperties.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import knex from '../../services/knex.service.js';
import getRelevantProductFields from '../helpers/getRelevantProductFields.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';

type GetAdminProductOutput = Partial<
    CamelCaseProperties<Omit<DBProduct, 'category_id'>> & {
        category: string;
        initialImageName: string;
        additionalImageName: string;
    }
>;

type PossibleGraphQLFields = {
    [productField in keyof GetAdminProductOutput]: {};
};

const getAdminProduct = async (
    _: any,
    args: { productId: number },
    context: ApolloServerContext,
    resolveInfo: GraphQLResolveInfo
): Promise<GetAdminProductOutput> => {
    await validateUser(context.user);

    const requestedFields = graphqlFields(
        resolveInfo
    ) as PossibleGraphQLFields;
    const requestedFieldsList = Object.keys(
        requestedFields
    ) as (keyof PossibleGraphQLFields)[];

    // instead of fetching everything, we can be more granular by dynamically building a SELECT query
    // this way, the query will execute faster
    let queryBuilder = knex('products').select(
        getRelevantProductFields(requestedFieldsList)
    );

    if ('category' in requestedFields) {
        queryBuilder = queryBuilder.innerJoin(
            'product_categories',
            'products.category_id',
            '=',
            'product_categories.id'
        );
    }

    queryBuilder = queryBuilder.where({ 'products.id': args.productId });

    const sqlQuery: string = queryBuilder.toString();

    console.log(sqlQuery);

    const {
        rows: [product],
        rowCount,
    } = await dbPool.query<Partial<DBProduct>>(sqlQuery);

    if (rowCount === 0) {
        throw new ProductNotFoundError();
    }

    return mapRequestedFieldsToProductInfo(
        product,
        requestedFieldsList
    ) as GetAdminProductOutput;
};

export default getAdminProduct;
