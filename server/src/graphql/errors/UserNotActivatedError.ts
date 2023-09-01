import { GraphQLError } from 'graphql';

class UserNotActivatedError extends GraphQLError {
    constructor() {
        super('User must be activated to perform this action');
    }
}

export default UserNotActivatedError;
