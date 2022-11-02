import { RequestHandler } from 'express';

const ensureAuthentication: RequestHandler = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication is required'
        });
    }
    next();
};

export default ensureAuthentication;
