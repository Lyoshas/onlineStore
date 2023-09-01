import { GraphQLError } from 'graphql';

class UserNotAdminError extends GraphQLError {
    constructor() {
        super('User must be an admin to perform this action');
    }
}

export default UserNotAdminError;
