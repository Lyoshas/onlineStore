import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import DBProduct from '../../interfaces/DBProduct.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import dbPool from '../../services/postgres.service.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import getRelevantProductFields from '../helpers/getRelevantProductFields.js';
import knexInstance from '../../services/knex.service.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';
import { isProductInTheCart } from '../../models/product.js';
import { IsInTheCartError } from '../errors/IsInTheCartError.js';

type GetProductOutput = Partial<DisplayProduct>;

type PossibleGraphQLFields = {
    [productField in keyof DisplayProduct]?: {};
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
    const shouldGetIsInTheCart: boolean = 'isInTheCart' in requestedFields;

    if (shouldGetIsInTheCart && context.user === null) {
        throw new IsInTheCartError();
    }

    const sqlQuery: string = knexInstance('products')
        .select(getRelevantProductFields(requestedFieldsList))
        .where({ id: args.id })
        .toString();

    console.log(sqlQuery);

    const {
        rows: [product],
        rowCount,
    } = await dbPool.query<Partial<Omit<DBProduct, 'max_order_quantity'>>>(
        sqlQuery
    );

    if (rowCount === 0) {
        throw new ProductNotFoundError();
    }

    return {
        ...mapRequestedFieldsToProductInfo(product, requestedFieldsList),
        isInTheCart: shouldGetIsInTheCart
            ? await isProductInTheCart(context.user!.id, args.id)
            : void 0,
    } as GetProductOutput;
}

export default getProduct;
