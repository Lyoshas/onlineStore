import { gql } from '../../../__generated__/gql';

const GET_PRODUCT_DETAILS = gql(`
    query ProductDetails($productId: Int!) {
        adminProduct(productId: $productId) {
            title
            price
            initialImageUrl
            additionalImageUrl
            shortDescription
            quantityInStock
        }
    }
`);

export default GET_PRODUCT_DETAILS;
