import { gql } from '../../../__generated__';

export const GET_FEATURED_PRODUCTS_NO_AUTH = gql(`
    query FeaturedProductsNoAuth {
        featuredProducts {
            id
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

export const GET_FEATURED_PRODUCTS_WITH_AUTH = gql(`
    query FeaturedProductsWithAuth {
        featuredProducts {
            id
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
