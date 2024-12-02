import { NextFunction, Request, Response } from 'express';

const corsHandler = (req: Request, res: Response, next: NextFunction) => {
	// specifies which origins are allowed to access the resource
	res.setHeader(
		'Access-Control-Allow-Origin',
		'https://onlinestore-potapchuk.click'
	);
	// lists the HTTP methods that are allowed for CORS
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	// specifies which headers can be used for CORS
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization'
	);
	// indicates whether credentials (like cookies or HTTP authentication) are allowed to be sent. For example:
	res.setHeader('Access-Control-Allow-Credentials', 'true');

	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}

	next();
};

export default corsHandler;
