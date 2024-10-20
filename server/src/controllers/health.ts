import { RequestHandler } from 'express';

export const checkHealth: RequestHandler = (req, res, next) => {
	res.status(200).json({ status: 'healthy' });
};
