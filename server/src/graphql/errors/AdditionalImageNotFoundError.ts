import { GraphQLError } from 'graphql';

class AdditionalImageNotFoundError extends GraphQLError {
    constructor() {
        super('additionalImageName does not exist in the S3 bucket');
    }
}

export default AdditionalImageNotFoundError;
