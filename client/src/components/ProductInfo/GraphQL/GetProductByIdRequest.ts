import { gql } from '../../../__generated__';

const GET_PRODUCT_BY_ID = gql(`
    query GetProductById($productId: Int!) {
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

export default GET_PRODUCT_BY_ID;
