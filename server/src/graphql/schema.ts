import getProduct from './resolvers/getProduct.js';
import getProductsByCategoryAndPage from './resolvers/getProductsByCategoryAndPage.js';
import addProduct from './resolvers/addProduct.js';
import updateProduct from './resolvers/updateProduct.js';
import deleteProduct from './resolvers/deleteProduct.js';
import getFeaturedProducts from './resolvers/getFeaturedProducts.js';
import getAdminProduct from './resolvers/getAdminProduct.js';
import addProductReview from './resolvers/addProductReview.js';
import getProductsBySearchQuery from './resolvers/getProductsBySearchQuery.js';

export const typeDefs = `#graphql
    type Query {
        "Get products by category and page"
        products(category: String!, page: Int!): GetProductsByPage!
        "Get a single product by its id"
        product(id: Int!): ProductInfoWithReviews!
        "Get featured products"
        featuredProducts: [ProductInfoWithoutReviews!]!
        "Get products by search query"
        searchProducts(searchQuery: String!, page: Int!): GetProductsByPage!
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
            shortDescription: String!,
            maxOrderQuantity: Int
        ): ProductUpsertReturnValue!

        updateProduct(
            id: Int!,
            title: String!,
            price: Float!,
            category: String!,
            initialImageName: String!,
            additionalImageName: String!,
            quantityInStock: Int!,
            shortDescription: String!,
            maxOrderQuantity: Int!
        ): ProductUpsertReturnValue!

        deleteProduct(id: Int!): DeleteProductReturnValue

        addProductReview(
            productId: Int!,
            reviewMessage: String!,
            starRating: Float!
        ): AddProductReviewReturnValue!
    }

    type DeleteProductReturnValue {
        id: Int!
    }

    type GetProductsByPage {
        productList: [ProductInfoWithoutReviews!]!
        totalPages: Int!
    }

    type ProductReview {
        userId: Int!
        fullName: String!
        reviewMessage: String!
        starRating: Float!
        "createdAt specifies the review creation date (DD.MM.YYYY)"
        createdAt: String!
    }

    type ProductInfoWithReviews {
        id: Int!
        title: String!
        price: Float!
        category: String!
        initialImageUrl: String!
        additionalImageUrl: String!
        shortDescription: String!
        isInTheCart: Boolean!
        userCanAddReview: Boolean!
        isAvailable: Boolean!
        isRunningOut: Boolean!
        userRating: Float
        reviews: [ProductReview!]!
    }

    type ProductInfoWithoutReviews {
        id: Int!
        title: String!
        price: Float!
        category: String!
        initialImageUrl: String!
        additionalImageUrl: String!
        shortDescription: String!
        isInTheCart: Boolean!
        isAvailable: Boolean!
        isRunningOut: Boolean!
        userRating: Float
    }

    type ProductUpsertReturnValue {
        id: Int!
        title: String!
        price: Float!
        category: String!
        initialImageUrl: String!
        additionalImageUrl: String!
        shortDescription: String!
        maxOrderQuantity: Int!
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
        initialImageName: String!
        additionalImageName: String!
        quantityInStock: Int!
        shortDescription: String!
        maxOrderQuantity: Int!
    }

    type AddProductReviewReturnValue {
        "returning a composite primary key of the recently added product review"
        productId: Int!
        userId: Int!
    }
`;

export const resolvers = {
    Query: {
        products: getProductsByCategoryAndPage,
        product: getProduct,
        featuredProducts: getFeaturedProducts,
        adminProduct: getAdminProduct,
        searchProducts: getProductsBySearchQuery,
    },
    Mutation: {
        addProduct,
        updateProduct,
        deleteProduct,
        addProductReview,
    },
};
