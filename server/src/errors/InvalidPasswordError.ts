import CustomError from './CustomError.js';

export default class InvalidCredentialsError extends CustomError {
    statusCode = 401;

    constructor() {
        super();
    }

    serializeErrors() {
        return [{ message: 'Invalid credentials' }]
    }
}
