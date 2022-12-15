import {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLFloat,
    GraphQLBoolean,
    GraphQLNonNull,
    GraphQLList,
    GraphQLSchema
} from 'graphql';

import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';
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

function validateUser(user: VerifiedUserInfo | null) {
    if (!user) {
        throw new Error('User must be authenticated to perform this action');
    }

    if (!user.isActivated) {
        throw new Error('User must be activated to perform this action');
    }

    if (!user.isAdmin) {
        throw new Error('User must be an admin to perform this action');
    }
}

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
            resolve(parent, args, req) {
                validateUser(req.user);

                return dbPool.query(
                    `INSERT INTO products (
                        title,
                        price,
                        preview_url,
                        quantity_in_stock
                    ) VALUES ($1, $2, $3, $4) RETURNING id`,
                    [
                        args.title,
                        args.price,
                        args.previewURL,
                        args.quantityInStock
                    ]
                ).then(({ rows }) => ({
                    id: rows[0].id,
                    title: args.title,
                    previewURL: args.previewURL,
                    isAvailable: args.quantityInStock > 1,
                    isRunningOut: args.quantityInStock <= 5
                }));
            }
        }
    })
});

export default new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutationType
});
