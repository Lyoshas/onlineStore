import { gql } from '../../__generated__';

export const GET_PRODUCTS_BY_PAGE_NO_AUTH = gql(`
    query GetProductsByPageNoAuth($category: String!, $page: Int!) {
        products(category: $category, page: $page) {
            productList {
                id
                title
                price
                category
                initialImageUrl
                additionalImageUrl
                shortDescription
                isAvailable
                isRunningOut
            }
            totalPages
        }
    }
`);

export const GET_PRODUCTS_BY_PAGE_WITH_AUTH = gql(`
    query GetProductsByPageWithAuth($category: String!, $page: Int!) {
        products(category: $category, page: $page) {
            productList {
                id
                title
                price
                category
                initialImageUrl
                additionalImageUrl
                shortDescription
                isAvailable
                isRunningOut
                isInTheCart
            }
            totalPages
        }
    }
`);
