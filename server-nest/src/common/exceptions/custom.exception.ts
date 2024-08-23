import { HttpException, HttpStatus } from '@nestjs/common';
import { ApplicationError } from '../interfaces/application-error.interface';

export abstract class CustomException extends HttpException {
    public errors: ApplicationError[];

    constructor(errors: ApplicationError[], httpStatus: HttpStatus) {
        super(errors, httpStatus);
        this.errors = errors;
    }
}
