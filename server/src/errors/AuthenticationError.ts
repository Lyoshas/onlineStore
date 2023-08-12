import CustomError from './CustomError.js';

export default class AuthenticationError extends CustomError {
    statusCode = 401;

    constructor(private errorMessage: string) {
        super();
    }

    serializeErrors() {
        return [{ message: this.errorMessage }];
    }
}
