import { GraphQLError } from 'graphql';

class ProductNotFoundError extends GraphQLError {
    constructor() {
        super('A product with the specified id does not exist');
    }
}

export default ProductNotFoundError;

