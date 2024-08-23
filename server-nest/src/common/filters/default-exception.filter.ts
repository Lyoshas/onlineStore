import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationError } from '../interfaces/application-error.interface';
import { CustomException } from '../exceptions/custom.exception';

// this exception filter will catch all errors that are thrown across the entire application
@Catch()
export class DefaultExceptionFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const {
            status,
            errors,
        }: { status: number; errors: ApplicationError[] } =
            exception instanceof CustomException
                ? {
                      status: exception.getStatus(),
                      errors: exception.errors,
                  }
                : {
                      status: HttpStatus.INTERNAL_SERVER_ERROR,
                      errors: [{ message: 'Something went wrong' }],
                  };

        if (!(exception instanceof CustomException)) {
            console.error(exception);
        }

        response.status(status).json({ errors });
    }
}
