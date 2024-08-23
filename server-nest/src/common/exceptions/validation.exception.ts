import { HttpStatus } from '@nestjs/common';
import { CustomException } from './custom.exception';
import { ApplicationError } from '../interfaces/application-error.interface';

type ValidationError = Required<ApplicationError>;

export class ValidationException extends CustomException {
    constructor(errors: ValidationError[]) {
        super(errors, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
