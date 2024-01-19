import { GraphQLError } from 'graphql';

export class ReviewAlreadyExistsError extends GraphQLError {
    constructor() {
        super('Only one review per user is allowed for each product');
    }
}
