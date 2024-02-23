import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import * as userModel from '../models/user.js';
import * as activationModel from '../models/account-activation.js';
import * as refreshTokenModel from '../models/refresh-token.js';
import * as accessTokenModel from '../models/access-token.js';
import InvalidCredentialsError from '../errors/InvalidPasswordError.js';
import AccountNotActivatedError from '../errors/AccountNotActivatedError.js';
import CustomValidationError from '../errors/CustomValidationError.js';

export const postSignIn: RequestHandler<
    {},
    { accessToken: string },
    { login: string; password: string }
> = asyncHandler(async (req, res, next) => {
    const userId = await userModel.getUserIdByCredentials(
        // the login must be an email of the user who is trying to log in
        req.body.login,
        req.body.password
    );

    if (userId === null) {
        throw new InvalidCredentialsError();
    }

    if (!(await activationModel.isAccountActivated(userId))) {
        throw new AccountNotActivatedError();
    }

    const { refreshToken, expiresAt } =
        await refreshTokenModel.generateRefreshToken(userId);

    refreshTokenModel.attachRefreshTokenAsCookie(res, refreshToken, expiresAt);

    res.status(200).json({
        accessToken: await accessTokenModel.generateAccessToken(userId),
    });
});

export const acquireNewAccessToken: RequestHandler<
    {},
    { accessToken: string }
> = asyncHandler(async (req, res, next) => {
    // refreshToken exists because we made sure it's the case by using express-validator
    const refreshToken: string = req.cookies.refreshToken;
    const userId = await refreshTokenModel.getUserIdByRefreshToken(
        refreshToken
    );

    if (userId === null) {
        throw new CustomValidationError({
            message: 'Invalid refresh token',
            field: 'refreshToken',
        });
    }

    res.json({
        accessToken: await accessTokenModel.generateAccessToken(userId),
    });
});
