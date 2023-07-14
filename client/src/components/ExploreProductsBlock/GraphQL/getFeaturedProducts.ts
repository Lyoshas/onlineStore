import { gql } from '../../../__generated__';

const GET_FEATURED_PRODUCTS = gql(`
    query FeaturedProducts {
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

export default GET_FEATURED_PRODUCTS;
