import CustomError from './CustomError.js';
import ApplicationError from '../interfaces/ApplicationError.js';

export default class CustomValidationError extends CustomError {
    statusCode = 422;

    constructor(private errorInformation: Required<ApplicationError>) {
        super();
    }

    serializeErrors() {
        const { message, field } = this.errorInformation;

        return [{ message, field }];
    }
}
