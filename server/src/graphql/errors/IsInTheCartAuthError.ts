import { GraphQLError } from 'graphql';

export class IsInTheCartAuthError extends GraphQLError {
    constructor() {
        super('User must be authenticated to request the "isInTheCart" field');
    }
}
