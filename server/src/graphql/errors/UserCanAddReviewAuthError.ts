import { GraphQLError } from 'graphql';

export class UserCanAddReviewAuthError extends GraphQLError {
    constructor() {
        super(
            'User must be authenticated to request the "userCanAddReview" field'
        );
    }
}
