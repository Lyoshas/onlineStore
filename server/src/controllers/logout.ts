import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import RefreshTokenModel from '../models/refresh-token.js';

export const handleLogout: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const refreshTokenModel = new RefreshTokenModel();

        // we have already validated the refresh token in the route declaration
        await refreshTokenModel.deleteRefreshTokenFromDB(
            req.cookies.refreshToken as string
        );

        RefreshTokenModel.detachRefreshTokenAsCookie(res);
        res.sendStatus(204);
    }
);
