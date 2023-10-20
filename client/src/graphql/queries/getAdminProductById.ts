import { gql } from '../../__generated__/gql';

const GET_ADMIN_PRODUCT_DETAILS = gql(`
    query ProductDetails($productId: Int!) {
        adminProduct(productId: $productId) {
            title
            price
            category
            initialImageUrl
            additionalImageUrl
            initialImageName
            additionalImageName
            shortDescription
            quantityInStock
            maxOrderQuantity
        }
    }
`);

export default GET_ADMIN_PRODUCT_DETAILS;
