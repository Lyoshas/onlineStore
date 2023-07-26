import { gql } from '../../../__generated__';

const GET_PRODUCTS_BY_PAGE = gql(`
    query GetProductsByPage($page: Int!) {
        products(page: $page) {
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

export default GET_PRODUCTS_BY_PAGE;
