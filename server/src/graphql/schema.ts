import {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLFloat,
    GraphQLNonNull,
    GraphQLList,
    GraphQLSchema
} from 'graphql';

import ProductType from './types/ProductType';
import getProductResolver from './resolvers/getProduct';
import getProductsByPageResolver from './resolvers/getProductsByPage';
import addProductResolver from './resolvers/addProduct';
import updateProductResolver from './resolvers/updateProduct';

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        product: {
            type: ProductType,
            args: { id: { type: GraphQLInt } },
            resolve: getProductResolver
        },
        products: {
            type: new GraphQLList(ProductType),
            args: { page: { type: GraphQLInt } },
            resolve: getProductsByPageResolver
        }
    }
});

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addProduct: {
            type: ProductType,
            description: 'Add a product',
            args: {
                title: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                price: {
                    type: new GraphQLNonNull(GraphQLFloat)
                },
                previewURL: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                quantityInStock: {
                    type: new GraphQLNonNull(GraphQLInt)
                }
            },
            resolve: addProductResolver
        },
        updateProduct: {
            type: ProductType,
            description: 'Update a product',
            args: {
                id: { type: new GraphQLNonNull(GraphQLInt) },
                title: { type: GraphQLString },
                price: { type: GraphQLFloat },
                previewURL: { type: GraphQLString },
                quantityInStock: { type: GraphQLInt }
            },
            resolve: updateProductResolver
        }
    })
});

export default new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutationType
});
