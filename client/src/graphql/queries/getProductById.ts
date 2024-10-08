import { gql } from '../../__generated__';

export const GET_PRODUCT_BY_ID_NO_AUTH = gql(`
    query GetProductByIdNoAuth($productId: Int!) {
        product(id: $productId) {
            id
            title
            price
            initialImageUrl
            additionalImageUrl
            shortDescription
            isAvailable
            isRunningOut
            userRating
            reviews {
                userId
                fullName
                reviewMessage
                starRating
                createdAt
            }
        }
    } 
`);

export const GET_PRODUCT_BY_ID_WITH_AUTH = gql(`
    query GetProductByIdWithAuth($productId: Int!) {
        product(id: $productId) {
            id
            title
            price
            initialImageUrl
            additionalImageUrl
            shortDescription
            isAvailable
            isRunningOut
            isInTheCart
            userCanAddReview
            userRating
            reviews {
                userId
                fullName
                reviewMessage
                starRating
                createdAt
            }
        }
    }
`);
