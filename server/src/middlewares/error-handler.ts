import { Request, Response, NextFunction } from 'express';

import CustomError from '../errors/CustomError.js';
import ApplicationError from '../interfaces/ApplicationError.js';
import { logger } from '../loggers/logger.js';

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
        // якщо тіло запиту занадто велике, логуємо це
		const message = 'Request body is too large';
		logger.info(message);
		return res.status(413).json({ errors: [{ message }] });
	} else {
        // якщо трапилася непередбачувана помилка, логуємо це
		logger.error(err.message);
	}

	return res
		.status(500)
		.json({ errors: [{ message: 'Something went wrong' }] });
};

export default errorHandler;
