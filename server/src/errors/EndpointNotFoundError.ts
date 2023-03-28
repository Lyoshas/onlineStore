import CustomError from './CustomError';

class EndpointNotFoundError extends CustomError {
    statusCode = 404;

    serializeErrors() {
        return [{ message: 'Endpoint not found' }];
    }
}

export default EndpointNotFoundError;
