import { GraphQLError } from 'graphql';

export class IncorrectProductReviewLengthError extends GraphQLError {
    constructor() {
        super('reviewMessage length must be between 1 and 2000 characters');
    }
}
