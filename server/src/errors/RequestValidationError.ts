import { ValidationError } from 'express-validator';

import CustomError from './CustomError';

// this class should only be used in conjunction with "express-middleware"
// otherwise use CustomValidationError
export default class RequestValidationError extends CustomError {
    public statusCode = 422;

    constructor(private validationErrors: ValidationError[]) {
        super();
    }

    serializeErrors() {
        return this.validationErrors.map((error) => {
            return { message: error.msg, field: error.param };
        });
    }
}
