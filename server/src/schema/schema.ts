import {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLFloat,
    GraphQLBoolean,
    GraphQLList,
    GraphQLSchema
} from 'graphql';

import dbPool from '../util/database';

const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLInt },
        title: { type: GraphQLString },
        price: { type: GraphQLFloat },
        previewURL: { type: GraphQLString },
        isAvailable: { type: GraphQLBoolean },
        isRunningOut: { type: GraphQLBoolean }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        product: {
            type: ProductType,
            args: { id: { type: GraphQLInt } },
            resolve(parent, args) {
                // code to get data from the DB
                return dbPool.query(
                    'SELECT * FROM products WHERE id = $1',
                    [args.id]
                ).then(({ rows }) => {
                    const product = rows[0];
                    return {
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        previewURL: product.preview_url,
                        isAvailable: product.quantity_in_stock > 1,
                        isRunningOut: product.quantity_in_stock <= 5
                    };
                });
            }
        },
        products: {
            type: new GraphQLList(ProductType),
            args: { page: { type: GraphQLInt } },
            resolve(parent, args) {
                const productsPerPage: number = parseInt(
                    process.env.PRODUCTS_PER_PAGE as string
                );

                return dbPool.query(
                    'SELECT * FROM products OFFSET $1 LIMIT $2',
                    [productsPerPage * (+args.page - 1), productsPerPage]
                ).then(({ rows }) => {
                    return rows.map(product => ({
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        previewURL: product.preview_url,
                        isAvailable: product.quantity_in_stock > 1,
                        isRunningOut: product.quantity_in_stock <= 5
                    }));
                });
            }
        }
    }
});

export default new GraphQLSchema({
    query: RootQuery
});
