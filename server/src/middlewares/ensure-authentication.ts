import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import AuthenticationError from '../errors/AuthenticationError';

const ensureAuthentication: RequestHandler = asyncHandler(
    async (req, res, next) => {
        if (!req.user) {
            throw new AuthenticationError('Authentication is required');
        }

        next();
    }
);

export default ensureAuthentication;
