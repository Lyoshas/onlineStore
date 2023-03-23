import { RequestHandler } from 'express';
import bcryptjs from 'bcryptjs';
import asyncHandler from 'express-async-handler';

import * as authModel from '../models/auth';
import * as userModel from '../models/user';
import * as helperModel from '../models/helper';
import OAuthUserData from '../interfaces/OAuthUserData';
import UnexpectedError from '../errors/UnexpectedError';
import CustomValidationError from '../errors/CustomValidationError';
import InvalidCredentialsError from '../errors/InvalidPasswordError';
import dbPool from '../util/database';
import AccountNotActivatedError from '../errors/AccountNotActivatedError';
import AccountActivatedError from '../errors/AccountActivatedError';

export const postSignUp: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const {
            firstName,
            lastName,
            email,
            password: plainPassword,
            phoneNumber,
        } = req.body;

        const activationToken = await userModel.generateRandomString(32);

        // You must use the same client instance for all statements within a transaction.
        // PostgreSQL isolates a transaction to individual clients.
        // This means if you initialize or use transactions with the pool.query method you will have problems.
        // Do not use transactions with the pool.query method.
        // more: https://node-postgres.com/features/transactions
        const dbClient = await dbPool.connect();

        await helperModel.beginTransaction(dbClient);

        try {
            const insertedId = await authModel
                .signUpUser({
                    firstName,
                    lastName,
                    email,
                    password: await bcryptjs.hash(plainPassword, 12),
                    phoneNumber,
                    // it's necessary to make the request using this client because transactions should be performed within a single client
                    dbClient
                })
                .then(({ rows }) => rows[0].id);

            await authModel.addTokenToRedis({
                tokenType: 'activationToken',
                token: activationToken,
                userId: insertedId,
                expirationTimeInSeconds:
                    +process.env.ACTIVATION_TOKEN_EXPIRATION_IN_SECONDS!
            });
        } catch (e) {
            console.log(e);
            helperModel.rollbackTransaction(dbClient);
            throw new UnexpectedError();
        }

        await helperModel.commitTransaction(dbClient);

        const activationLink = authModel.generateAccountActivationLink(
            req.get('host')!,
            activationToken
        );

        userModel.sendEmail(
            email,
            '[onlineStore] Підтвердження email',
            `
                <p>Дякуємо за реєстрацію!</p>
                <p>Будь ласка, перейдіть за посиланням для підтвердження електронної пошти:</p>
                <a href="${activationLink}">${activationLink}</a>
            `
        );

        res.status(201).json({
            msg: 'A new account has been created. Email confirmation is required.',
        });
    }
);

export const activateAccount: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const activationToken = req.params.activationToken;

        const userId = await authModel.getUserIdByActivationToken(
            activationToken
        );

        if (userId === null) {
            throw new CustomValidationError({
                message: 'The activation token is either invalid or expired',
                field: 'activationToken'
            });
        }

        console.log('USER_ID TYPE CHECKING!');
        console.log(userId);
        console.log(typeof userId);
        await authModel.activateAccount(+userId);

        res.status(200).json({ msg: 'The account has been activated' });
    }
);

export const postSignIn: RequestHandler<
    {},
    { accessToken: string },
    { login: string; password: string }
> = asyncHandler(
    async (req, res, next) => {
        const userId = await authModel.getUserIdByCredentials(
            // the login can be either a mobile phone (+380-XX-XXX-XX-XX) or an email
            req.body.login,
            req.body.password
        );

        if (userId === null) {
            throw new InvalidCredentialsError();
        }

        if ( !(await authModel.isAccountActivated(userId)) ) {
            throw new AccountNotActivatedError();
        }

        const {
            refreshToken,
            expiresAt
        } = await authModel.generateRefreshToken(userId);

        authModel.attachRefreshTokenAsCookie(res, refreshToken, expiresAt);

        res.status(200).json({
            accessToken: await authModel.generateAccessToken(userId)
        });
    }
);

export const getURLToOAuthAuthorizationServer: RequestHandler = asyncHandler(
    async (req, res, next) => {
        // for now the supported options are facebook and google
        const authorizationServerName =
            req.params.authorizationServerName.toLowerCase();

        if (!['google', 'facebook'].includes(authorizationServerName)) {
            throw new CustomValidationError({
                message:
                    'Invalid authorization server name: ' +
                    'it can be either "google" or "facebook"',
                field: 'authorizationServerName',
            });
        }

        const state = (await userModel.generateRandomString(32)) as string;
        const authorizationServerId =
            await authModel.getAuthorizationServerIdByName(
                authorizationServerName
            );

        if (authorizationServerId === null) {
            throw new UnexpectedError(
                'Unexpected error occurred while retrieving the authorization server id'
            );
        }

        await authModel.addOAuthStateToDB(state, authorizationServerId);

        res.status(200).json({
            URL:
                authorizationServerName === 'google'
                    ? authModel.getURLToGoogleAuthorizationServer(state)
                    : authModel.getURLToFacebookAuthorizationServer(state),
        });
    }
);

export const OAuthCallback: RequestHandler<
    {},
    { accessToken: string },
    {},
    { state: string; code: string }
> = asyncHandler(async (req, res, next) => {
    const { state, code } = req.query;

    const authServerName = await authModel.getAuthorizationServerNameByState(
        state
    );

    if (!authServerName) {
        throw new CustomValidationError({
            message: 'Invalid "state" parameter',
            field: 'state',
        });
    }

    await authModel.deleteOAuthState(state);

    let userData: OAuthUserData;

    if (authServerName === 'google') {
        const idToken = await authModel.getGoogleIdToken(
            process.env.GOOGLE_CLIENT_ID as string,
            process.env.GOOGLE_CLIENT_SECRET as string,
            code,
            'authorization_code',
            process.env.OAUTH_REDIRECT_URI as string
        );

        userData = authModel.getUserDataFromGoogleIdToken(idToken);
    } else if (authServerName === 'facebook') {
        userData = await authModel.getUserDataFromFacebookAccessToken(
            await authModel.getFacebookAccessTokenByCode(code)
        );
    } else {
        throw new UnexpectedError('Invalid authorization server name');
    }

    const { firstName, lastName, email, avatarURL } = userData;

    // check if the user is signed up with userModel.getUserIdByEmail
    let userId = await userModel.getUserIdByEmail(email);
    let responseStatus: number = 200;

    if (userId === null) {
        // the user is new, so perform a signup
        userId = await authModel
            .signUpUser({
                firstName,
                lastName,
                email,
                password: await bcryptjs.hash(
                    authModel.generateStrongPassword(),
                    12
                ),
                phoneNumber: null,
                avatarURL,
                withOAuth: true
            })
            .then(({ rows }) => rows[0].id) as number;

        responseStatus = 201;
    }

    const {
        refreshToken,
        expiresAt
    } = await authModel.generateRefreshToken(userId);

    authModel.attachRefreshTokenAsCookie(res, refreshToken, expiresAt);

    // if we make it here, the user is already signed up, so just sign them in
    res.status(responseStatus).json({
        accessToken: await authModel.generateAccessToken(userId)
    });
});

// query
export const isEmailAvailable: RequestHandler<
    {},
    {},
    {},
    { email: string } // defining req.query
> = asyncHandler(async (req, res, next) => {
    const email = req.query.email;

    res.json({
        isEmailAvailable: await authModel.isEmailAvailable(email),
    });
});

export const acquireNewAccessToken: RequestHandler<
    {},
    { accessToken: string }
> = asyncHandler(async (req, res, next) => {
    // refreshToken exists because we made sure it's the case by using express-validator
    const refreshToken: string = req.cookies.refreshToken;
    const userId = await authModel.getUserIdByRefreshToken(refreshToken);

    if (userId === null) {
        throw new CustomValidationError({
            message: 'Invalid refresh token',
            field: 'refreshToken'
        });
    }

    res.json({
        accessToken: await authModel.generateAccessToken(userId)
    });
});

export const resendActivationLink: RequestHandler<
    {},
    { targetEmail: string },
    { login: string; password: string }
> = asyncHandler(async (req, res, next) => {
    const userId = await authModel.getUserIdByCredentials(
        // the login can be either a mobile phone (+380-XX-XXX-XX-XX) or an email
        req.body.login,
        req.body.password
    );

    if (userId === null) {
        throw new InvalidCredentialsError();
    }

    if ( await authModel.isAccountActivated(userId) ) {
        // you can't send the activation link again if the account is already activated
        throw new AccountActivatedError();
    } 

    const email = await userModel.getEmailByUserId(userId);

    if (email === null) {
        throw new UnexpectedError('Email associated with userId was not found');
    }

    const activationToken = await userModel.generateRandomString(32);
    await authModel.addTokenToRedis({
        tokenType: 'activationToken',
        token: activationToken,
        userId,
        expirationTimeInSeconds:
            +process.env.ACTIVATION_TOKEN_EXPIRATION_IN_SECONDS!
    });

    const activationLink = authModel.generateAccountActivationLink(
        req.get('host')!,
        activationToken
    );

    await userModel.sendEmail(
        email,
        '[onlineStore] Підтвердження email',
        `
            <p>Ви надіслали запит на повторну активацію акаунту.</p>
            <p>Будь ласка, перейдіть за посиланням для підтвердження електронної пошти:</p>
            <a href="${activationLink}">${activationLink}</a>
        `
    );

    res.status(200).json({ targetEmail: email });
});

// this route sends a so-called "reset token"
// it will be used to reset the user's password
// for this, "email" and "recaptchaToken" are needed in the request body
export const sendResetTokenToEmail: RequestHandler<
    {},
    { msg: string },
    { email: string; recaptchaToken: string }
> = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const userId = await userModel.getUserIdByEmail(email);

    if (userId === null) {
        throw new CustomValidationError({
            message: 'There is no user with the corresponding email',
            field: 'email'
        });
    }

    const resetToken = await userModel.generateRandomString(32);
    await authModel.addTokenToRedis({
        tokenType: 'resetToken',
        token: resetToken,
        userId,
        expirationTimeInSeconds:
            +process.env.RESET_TOKEN_EXPIRATION_IN_SECONDS!
    });

    const resetLink = authModel.generateResetPasswordLink(
        req.get('host')!,
        resetToken
    );

    userModel.sendEmail(
        email,
        '[onlineStore] Змінення пароля',
        `
            <p>Ви запросили посилання для змінення пароля.</p>
            <p>Будь ласка, перейдіть за посиланням:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Це посилання дійсне лише протягом 1 години.</p>
        `
    );

    res.status(200).json({
        msg: 'The link has been sent to the corresponding email'
    })
});

export const changePassword: RequestHandler<
    {},
    { msg: string },
    { resetToken: string; password: string }
> = asyncHandler(async (req, res, next) => {
    const { resetToken } = req.body;
    const userId = await authModel.getUserIdByResetToken(resetToken);

    if (!userId) {
        throw new CustomValidationError({
            message: 'resetToken is either invalid or has expired',
            field: 'resetToken'
        });
    }

    const client = await dbPool.connect();

    try {
        // The operation of changing the password and revoking the resetToken cannot be performed separately, so a transaction is required.
        // Either both operations are successful, or none of them are persisted
        await helperModel.beginTransaction(client);

        await authModel.changePassword(
            userId,
            await bcryptjs.hash(req.body.password, 12),
            client
        );    
    
        await authModel.revokeResetToken(resetToken);

        await helperModel.commitTransaction(client);

        res.status(200).json({ msg: 'The password has been changed.' });
    } catch (e) {
        await helperModel.rollbackTransaction(client);
        throw new UnexpectedError('Something went wrong');
    }
});

export const isResetTokenValid: RequestHandler<
    { resetToken: string },
    { isValid: boolean }
> = asyncHandler(async (req, res, next) => {
    const userId = await authModel.getUserIdByResetToken(
        req.params.resetToken
    );

    res.status(200).json({ isValid: userId !== null});
});
