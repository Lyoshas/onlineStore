import { GraphQLError } from 'graphql';

export class PriceOutOfRangeError extends GraphQLError {
    constructor() {
        super(
            'Price must be greater than 0 and less than or equal to 9999999.99'
        );
    }
}
