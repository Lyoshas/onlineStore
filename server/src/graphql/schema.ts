import getProduct from './resolvers/getProduct.js';
import getProductsByPage from './resolvers/getProductsByPage.js';
import addProduct from './resolvers/addProduct.js';
import updateProduct from './resolvers/updateProduct.js';
import deleteProduct from './resolvers/deleteProduct.js';
import getFeaturedProducts from './resolvers/getFeaturedProducts.js';
import getAdminProduct from './resolvers/getAdminProduct.js';

export const typeDefs = `#graphql
    type Query {
        "Get products by page number"
        products(page: Int!): GetProductByPageReturnValue!
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
            initialImageName: String!,
            additionalImageName: String!,
            quantityInStock: Int!,
            shortDescription: String!
        ): Product!

        updateProduct(
            id: Int!,
            title: String!,
            price: Float!,
            category: String!,
            initialImageName: String!,
            additionalImageName: String!,
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

    type GetProductByPageReturnValue {
        productList: [Product!]!
        totalPages: Int!
    }

    type AdminProduct {
        id: Int!
        title: String!
        price: Float!
        category: String!
        initialImageUrl: String!
        additionalImageUrl: String!
        initialImageName: String!
        additionalImageName: String!
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
