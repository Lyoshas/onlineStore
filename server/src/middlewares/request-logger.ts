import { RequestHandler } from 'express';
import { logger } from '../loggers/logger.js';

export const requestLogger: RequestHandler = (req, res, next) => {
	logger.info(`Request ${req.method} ${req.url}`);
	next();
};
