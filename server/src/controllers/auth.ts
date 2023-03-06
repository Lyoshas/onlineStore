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

            await authModel.addActivationTokenToDB(
                insertedId,
                activationToken
            );
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
    await authModel.addActivationTokenToDB(userId, activationToken);

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
