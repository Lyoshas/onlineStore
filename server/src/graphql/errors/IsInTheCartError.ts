import { GraphQLError } from 'graphql';

export class IsInTheCartError extends GraphQLError {
    constructor() {
        super('User must be authenticated to request the "isInTheCart" field');
    }
}
