import CustomError from './CustomError.js';

export default class UnexpectedError extends CustomError {
    public statusCode = 500;
    private errorMessage: string;

    constructor(errorMessage?: string) {
        super();
        this.errorMessage = errorMessage || 'Something went wrong';
    }

    serializeErrors() {
        return [{ message: this.errorMessage }];
    }
}
