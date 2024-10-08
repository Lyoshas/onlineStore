import { gql } from '../../__generated__/gql';

const UPDATE_PRODUCT = gql(`
    mutation UpdateProduct(
        $id: Int!,
        $title: String!,
        $price: Float!,
        $category: String!,
        $initialImageName: String!,
        $additionalImageName: String!,
        $quantityInStock: Int!,
        $shortDescription: String!,
        $maxOrderQuantity: Int!
    ) {
        updateProduct(
            id: $id,
            title: $title,
            price: $price,
            category: $category,
            initialImageName: $initialImageName,
            additionalImageName: $additionalImageName,
            quantityInStock: $quantityInStock,
            shortDescription: $shortDescription,
            maxOrderQuantity: $maxOrderQuantity
        ) {
            id
            initialImageUrl
            additionalImageUrl
            isAvailable
            isRunningOut
        }
    }
`);

export default UPDATE_PRODUCT;
