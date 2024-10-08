import { gql } from '../../__generated__/gql';

const ADD_PRODUCT = gql(`
    mutation AddProduct(
        $title: String!,
        $price: Float!,
        $category: String!,
        $initialImageName: String!,
        $additionalImageName: String!,
        $quantityInStock: Int!,
        $shortDescription: String!,
        $maxOrderQuantity: Int!
    ) {
        addProduct(
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
        }
    }
`);

export default ADD_PRODUCT;
