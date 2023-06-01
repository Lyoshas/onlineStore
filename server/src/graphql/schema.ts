import getProduct from './resolvers/getProduct';
import getProductsByPage from './resolvers/getProductsByPage';
import addProduct from './resolvers/addProduct';
import updateProduct from './resolvers/updateProduct';
import deleteProduct from './resolvers/deleteProduct';
import getFeaturedProducts from './resolvers/getFeaturedProducts';
import getAdminProduct from './resolvers/getAdminProduct';
import getSimilarProducts from './resolvers/getSimilarProducts';

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
        "Get similar products"
        similarProducts(productId: Int!): [Product]!
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

    type AdminProduct {
        id: Int!
        title: String!
        price: Float!
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
        similarProducts: getSimilarProducts,
    },
    Mutation: {
        addProduct,
        updateProduct,
        deleteProduct,
    },
};
