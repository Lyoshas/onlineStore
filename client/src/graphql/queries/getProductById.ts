import { gql } from '../../__generated__';

export const GET_PRODUCT_BY_ID_NO_AUTH = gql(`
    query GetProductByIdNoAuth($productId: Int!) {
        product(id: $productId) {
            title
            price
            initialImageUrl
            additionalImageUrl
            shortDescription
            isAvailable
            isRunningOut
        }
    } 
`);

export const GET_PRODUCT_BY_ID_WITH_AUTH = gql(`
    query GetProductByIdWithAuth($productId: Int!) {
        product(id: $productId) {
            title
            price
            initialImageUrl
            additionalImageUrl
            shortDescription
            isAvailable
            isRunningOut
            isInTheCart
        }
    }
`);
