import { GraphQLError } from 'graphql';

export class IncorrectStarRatingError extends GraphQLError {
    constructor() {
        super(
            'starRating must be between 1 and 5, inclusive, in increments of 0.5'
        );
    }
}
