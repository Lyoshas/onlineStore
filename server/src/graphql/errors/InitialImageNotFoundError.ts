import { GraphQLError } from 'graphql';

class InitialImageNotFoundError extends GraphQLError {
    constructor() {
        super('initialImageName does not exist in the S3 bucket');
    }
}

export default InitialImageNotFoundError;
