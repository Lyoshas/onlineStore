import { GraphQLError } from 'graphql';

class InitialImageMimeTypeError extends GraphQLError {
    constructor() {
        super('The MIME type of initialImageName is not "image/png"');
    }
}

export default InitialImageMimeTypeError;
