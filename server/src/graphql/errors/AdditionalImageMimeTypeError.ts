import { GraphQLError } from 'graphql';

class AdditionalImageMimeTypeError extends GraphQLError {
    constructor() {
        super('The MIME type of additionalImageName is not "image/png"');
    }
}

export default AdditionalImageMimeTypeError;
