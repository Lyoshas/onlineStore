import { GraphQLError } from 'graphql';

export const PRODUCT_NOT_FOUND_MESSAGE =
    'A product with the specified id does not exist';

class ProductNotFoundError extends GraphQLError {
    constructor() {
        super(PRODUCT_NOT_FOUND_MESSAGE);
    }
}

export default ProductNotFoundError;
