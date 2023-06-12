import getProduct from './resolvers/getProduct';
import getProductsByPage from './resolvers/getProductsByPage';
import addProduct from './resolvers/addProduct';
import updateProduct from './resolvers/updateProduct';
import deleteProduct from './resolvers/deleteProduct';
import getFeaturedProducts from './resolvers/getFeaturedProducts';
import getAdminProduct from './resolvers/getAdminProduct';

export const typeDefs = `#graphql
    type Query {
        "Get products by page number"
        products(page: Int!): [Product]!
        "Get a single product by its id"
        product(id: Int!): Product
        "Get featured products"
        featuredProducts: [Product]!
        "Get product info including 'quantity_in_stock' (only for admins)"
        adminProduct(productId: Int!): AdminProduct!
    }

    type Mutation {
        addProduct(
            title: String!,
            price: Float!,
            category: String!,
            initialImageUrl: String!,
            additionalImageUrl: String!,
            quantityInStock: Int!,
            shortDescription: String!
        ): Product!

        updateProduct(
            id: Int!,
            title: String!,
            price: Float!,
            category: String!,
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
        category: String!
        initialImageUrl: String!
        additionalImageUrl: String!
        shortDescription: String!
        isAvailable: Boolean!
        isRunningOut: Boolean!
    }

    type AdminProduct {
        id: Int!
        title: String!
        price: Float!
        category: String!
        initialImageUrl: String!
        additionalImageUrl: String!
        quantityInStock: Int!
        shortDescription: String!
    }
`;

export const resolvers = {
    Query: {
        products: getProductsByPage,
        product: getProduct,
        featuredProducts: getFeaturedProducts,
        adminProduct: getAdminProduct,
    },
    Mutation: {
        addProduct,
        updateProduct,
        deleteProduct,
    },
};
