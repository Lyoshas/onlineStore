import { Request, Response, NextFunction } from 'express';

import CustomError from '../errors/CustomError';
import ApplicationError from '../interfaces/ApplicationError';

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
    } else {
        console.log('another error???')
    }

    return res
        .status(500)
        .json({ errors: [{ message: 'Something went wrong' }] });
};

export default errorHandler;
