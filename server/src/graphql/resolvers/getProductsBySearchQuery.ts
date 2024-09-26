import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import * as Yup from 'yup';

import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import * as productModel from '../../models/product.js';
import { IsInTheCartAuthError } from '../errors/IsInTheCartAuthError.js';
import validateSchema from '../helpers/validateSchema.js';
import GetProductsByPageOutput from '../../interfaces/GetProductsByPageOutput.js';

const validationSchema = Yup.object({
    searchQuery: Yup.string()
        .required()
        .test(
            'search-query-length',
            "the 'searchQuery' parameter must be a string containing between 1 and 1000 characters",
            (value) => value.length > 0 && value.length <= 1000
        ),
    page: Yup.number()
        .required()
        .min(1, "the 'page' parameter must be greater than zero")
        .typeError("the 'page' parameter must be a number"),
});

async function getProductsBySearchQuery(
    parent: unknown,
    args: { searchQuery: string; page: number },
    context: ApolloServerContext,
    resolveInfo: GraphQLResolveInfo
): Promise<GetProductsByPageOutput> {
    await validateSchema(validationSchema, args);
    const userId: number | null =
        context.user !== null ? context.user.id : null;
    const requestedFields = graphqlFields(resolveInfo);
    if ('isInTheCart' in requestedFields.productList && userId === null) {
        throw new IsInTheCartAuthError();
    }

    const { productIDs, totalHits } =
        await productModel.getProductIDsBySearchQuery(
            args.searchQuery,
            args.page
        );

    const products = await productModel.getProductsByIDs(productIDs, userId);

    return {
        productList: products,
        totalPages: Math.ceil(
            totalHits / +process.env.PRODUCTS_PER_PAGE!
        ),
    };
}

export default getProductsBySearchQuery;
