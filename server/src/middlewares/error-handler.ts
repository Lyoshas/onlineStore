import { Request, Response, NextFunction } from 'express';

import CustomError from '../errors/CustomError.js';
import ApplicationError from '../interfaces/ApplicationError.js';

const errorHandler = (
    err: Error,
    req: Request,
    res: Response<{ errors: ApplicationError[] }>,
    next: NextFunction
) => {
    if (err instanceof CustomError) {
        return res
            .status(err.statusCode)
            .json({ errors: err.serializeErrors() });
    } else if (err.name === 'PayloadTooLargeError') {
        return res
            .status(413)
            .json({ errors: [{ message: 'Request body is too large' }] });
    } else {
        console.log(
            `An unexpected error occurred: ${req.method} ${req.originalUrl}`
        );
        console.error(err);
    }

    return res
        .status(500)
        .json({ errors: [{ message: 'Something went wrong' }] });
};

export default errorHandler;
