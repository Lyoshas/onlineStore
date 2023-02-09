import { RequestHandler } from 'express';
import AuthenticationError from '../errors/AuthenticationError';

const ensureAuthentication: RequestHandler = (req, res, next) => {
    if (!req.user) {
        throw new AuthenticationError('Authentication is required');
    }

    next();
};

export default ensureAuthentication;
