import { GraphQLError } from 'graphql';

export class QuantityInStockOutOfRangeError extends GraphQLError {
    constructor() {
        super('Quantity in stock must be between 0 and 32767');
    }
}
