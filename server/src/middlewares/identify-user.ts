import { RequestHandler } from 'express';

import * as accessTokenModel from '../models/access-token';
import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import UnexpectedError from '../errors/UnexpectedError';
import asyncHandler from 'express-async-handler';

declare global {
    namespace Express {
        interface Request {
            user: VerifiedUserInfo | null;
        }
    }
}

const identifyUser: RequestHandler = asyncHandler(async (req, res, next) => {
    const accessToken = req.headers.authorization?.split(' ')[1];

    try {
        if (!accessToken) {
            throw new JsonWebTokenError('The access token is not specified');
        }

        // if the access token is valid, set the user info in req.user and go to the next middleware
        req.user = await accessTokenModel.verifyAccessToken(accessToken);
    } catch (e) {
        // if the access token has expired
        if (e instanceof TokenExpiredError) {
            res.locals.hasAccessTokenExpired = true;
        } else if (e instanceof JsonWebTokenError) {
            res.locals.isAccessTokenInvalid = true;
        } else {
            throw new UnexpectedError();
        }

        req.user = null;
    } finally {
        next();
    }
});

export default identifyUser;
