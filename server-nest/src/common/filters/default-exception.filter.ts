import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { GraphQLError } from 'graphql';
import { ApplicationError } from '../interfaces/application-error.interface';
import { CustomException } from '../exceptions/custom.exception';

// this exception filter will catch all errors that are thrown across the entire application
@Catch()
export class DefaultExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status: number, errors: ApplicationError[];

        if (exception instanceof NotFoundException) {
            status = 404;
            errors = [{ message: 'Endpoint not found' }];
        } else if (exception instanceof CustomException) {
            status = exception.getStatus();
            errors = exception.errors;
        } else if (exception instanceof GraphQLError) {
            // don't handle the error, pass it on so that Apollo Server can handle it
            throw exception;
        } else {
            console.error(exception);
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            errors = [{ message: 'Something went wrong' }];
        }

        response.status(status).json({ errors });
    }
}
