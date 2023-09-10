import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';

import DBProduct from '../../interfaces/DBProduct.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import dbPool from '../../services/postgres.service.js';
import { PageOutOfRangeError } from '../errors/PageOutOfRangeError.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import knexInstance from '../../services/knex.service.js';
import getRelevantProductFields from '../helpers/getRelevantProductFields.js';
import mapRequestedFieldsToProductInfo from '../helpers/mapRequestedFieldsToProductInfo.js';
import RequireAtLeastOneProperty from '../../interfaces/RequireAtLeastOneProperty.js';

type GetProductsByPageOutput = RequireAtLeastOneProperty<{
    productList: Partial<DisplayProduct>[];
    totalPages: number;
}>;

interface PossibleGraphQLFields {
    productList?: {
        [productField in keyof DisplayProduct]?: {};
    };
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
    const requestedFields = graphqlFields(resolveInfo) as PossibleGraphQLFields;
    const resultProductList: GetProductsByPageOutput['productList'] = [];

    if (args.page <= 0) {
        throw new PageOutOfRangeError();
    }

    const productsPerPage: number = parseInt(
        process.env.PRODUCTS_PER_PAGE as string
    );

    // if the user requested products
    if (requestedFields.productList) {
        // instead of fetching every field of a product, we can be more granular by dynamically building a SELECT query
        // this way, the query will execute faster

        // getting products fields that the user requested
        const requestedProductFields = Object.keys(
            requestedFields.productList
        ) as (keyof DisplayProduct)[];

        const sqlQuery: string = knexInstance('products')
            .select(getRelevantProductFields(requestedProductFields))
            .offset(productsPerPage * (+args.page - 1))
            .limit(productsPerPage)
            .toString();
        
        const { rows } = await dbPool.query<
            Partial<Omit<DBProduct, 'max_order_quantity'>>
        >(sqlQuery);

        rows.forEach((productInfo) => {
            resultProductList.push(
                mapRequestedFieldsToProductInfo(
                    productInfo,
                    requestedProductFields
                ) as Partial<DisplayProduct>
            );
        });
    }

    return {
        ...(requestedFields.productList
            ? { productList: resultProductList }
            : {}),
        ...(requestedFields.totalPages
            ? { totalPages: await getTotalPages(productsPerPage) }
            : {}),
    } as GetProductsByPageOutput;
}

export default getProductsByPage;
