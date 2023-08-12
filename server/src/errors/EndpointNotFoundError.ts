import CustomError from './CustomError.js';

class EndpointNotFoundError extends CustomError {
    statusCode = 404;

    serializeErrors() {
        return [{ message: 'Endpoint not found' }];
    }
}

export default EndpointNotFoundError;
