import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import * as userModel from '../models/user';
import * as activationModel from '../models/account-activation';
import * as refreshTokenModel from '../models/refresh-token';
import * as accessTokenModel from '../models/access-token';
import InvalidCredentialsError from '../errors/InvalidPasswordError';
import AccountNotActivatedError from '../errors/AccountNotActivatedError';
import CustomValidationError from '../errors/CustomValidationError';

export const postSignIn: RequestHandler<
    {},
    { accessToken: string },
    { login: string; password: string }
> = asyncHandler(async (req, res, next) => {
    const userId = await userModel.getUserIdByCredentials(
        // the login can be either a mobile phone (+380-XX-XXX-XX-XX) or an email
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
