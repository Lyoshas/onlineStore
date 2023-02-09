import CustomError from './CustomError';
import ApplicationError from '../interfaces/ApplicationError';

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
