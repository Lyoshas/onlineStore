import { GraphQLError } from 'graphql';

export class MaxOrderQuantityOutOfRangeError extends GraphQLError {
    constructor() {
        super('Max order quantity must be between 1 and 32767');
    }
}
