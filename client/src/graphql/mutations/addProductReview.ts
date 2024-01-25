import { gql } from '../../__generated__';

const ADD_PRODUCT_REVIEW = gql(`
    mutation AddProductReview(
        $productId: Int!
        $reviewMessage: String!
        $starRating: Float!
    ) {
        addProductReview(
            productId: $productId
            reviewMessage: $reviewMessage
            starRating: $starRating
        ) {
            productId
            userId
        }
    }
`);

export default ADD_PRODUCT_REVIEW;
