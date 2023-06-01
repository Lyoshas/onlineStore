import { gql } from '../../../__generated__/gql';

const UPDATE_PRODUCT = gql(`
    mutation UpdateProduct(
        $id: Int!,
        $title: String!,
        $price: Float!,
        $initialImageUrl: String!,
        $additionalImageUrl: String!,
        $quantityInStock: Int!,
        $shortDescription: String!
    ) {
        updateProduct(
            id: $id,
            title: $title,
            price: $price,
            initialImageUrl: $initialImageUrl,
            additionalImageUrl: $additionalImageUrl,
            quantityInStock: $quantityInStock,
            shortDescription: $shortDescription
        ) {
            id
        }
    }
`);

export default UPDATE_PRODUCT;
