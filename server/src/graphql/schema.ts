import getProduct from './resolvers/getProduct';
import getProductsByPage from './resolvers/getProductsByPage';
import addProduct from './resolvers/addProduct';
import updateProduct from './resolvers/updateProduct';
import deleteProduct from './resolvers/deleteProduct';
import getFeaturedProducts from './resolvers/getFeaturedProducts';

export const typeDefs = `#graphql
    type Query {
        "Get products by page number"
        products(page: Int!): [Product]!
        "Get a single product by its id"
        product(id: Int!): Product
        "Get featured products"
        featuredProducts: [Product]!
    }

    type Mutation {
        addProduct(
            title: String!,
            price: Float!,
            initialImageUrl: String!,
            additionalImageUrl: String!,
            quantityInStock: Int!,
            shortDescription: String!
        ): Product!

        updateProduct(
            id: Int!,
            title: String!,
            price: Float!,
            initialImageUrl: String!,
            additionalImageUrl: String!,
            quantityInStock: Int!,
            shortDescription: String!
        ): Product!

        deleteProduct(id: Int!): DeleteProductReturnValue
    }

    type DeleteProductReturnValue {
        id: Int!
    }

    type Product {
        id: Int!
        title: String!
        price: Float!
        initialImageUrl: String!
        additionalImageUrl: String!
        shortDescription: String!
        isAvailable: Boolean!
        isRunningOut: Boolean!
    }
`;

export const resolvers = {
    Query: {
        products: getProductsByPage,
        product: getProduct,
        featuredProducts: getFeaturedProducts,
    },
    Mutation: {
        addProduct,
        updateProduct,
        deleteProduct,
    },
};
