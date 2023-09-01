import { GraphQLError } from 'graphql';

class UserNotAuthenticatedError extends GraphQLError {
    constructor() {
        super('User must be authenticated to perform this action');
    }
}

export default UserNotAuthenticatedError;
