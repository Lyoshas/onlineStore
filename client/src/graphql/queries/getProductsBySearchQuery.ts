import { gql } from '../../__generated__';

export const GET_PRODUCTS_BY_SEARCH_QUERY_NO_AUTH = gql(`
    query SearchProductsNoAuth($searchQuery: String!, $page: Int!) {
        searchProducts(searchQuery: $searchQuery, page: $page) {
            productList {
                id
                title
                price
                category
                initialImageUrl
                additionalImageUrl
                shortDescription
                userRating
                isAvailable
                isRunningOut
            }
            totalPages
        }
    }
`);

export const GET_PRODUCTS_BY_SEARCH_QUERY_WITH_AUTH = gql(`
    query SearchProductsWithAuth($searchQuery: String!, $page: Int!) {
        searchProducts(searchQuery: $searchQuery, page: $page) {
            productList {
                id
                title
                price
                category
                initialImageUrl
                additionalImageUrl
                shortDescription
                isInTheCart
                userRating
                isAvailable
                isRunningOut
            }
            totalPages
        }
    }
`);
