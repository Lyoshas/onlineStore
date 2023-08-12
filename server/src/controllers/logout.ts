import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import {
    deleteRefreshTokenFromDB,
    detachRefreshTokenAsCookie,
} from '../models/refresh-token.js';

export const handleLogout: RequestHandler = asyncHandler(
    async (req, res, next) => {
        // we have already validated the refresh token in the route declaration
        await deleteRefreshTokenFromDB(req.cookies.refreshToken as string);

        detachRefreshTokenAsCookie(res);
        res.sendStatus(204);
    }
);
