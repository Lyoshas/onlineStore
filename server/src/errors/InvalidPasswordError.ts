import CustomError from './CustomError';

export default class InvalidCredentialsError extends CustomError {
    statusCode = 401;

    constructor() {
        super();
    }

    serializeErrors() {
        return [{ message: 'Invalid credentials' }]
    }
}
