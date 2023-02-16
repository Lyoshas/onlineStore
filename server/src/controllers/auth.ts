import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';
import asyncHandler from 'express-async-handler';

import * as authModel from '../models/auth';
import * as userModel from '../models/user';
import * as helperModel from '../models/helper';
import OAuthUserData from '../interfaces/OAuthUserData';
import RequestValidationError from '../errors/RequestValidationError';
import UnexpectedError from '../errors/UnexpectedError';
import CustomValidationError from '../errors/CustomValidationError';
import InvalidCredentialsError from '../errors/InvalidPasswordError';
import dbPool from '../util/database';
import AccountNotActivatedError from '../errors/AccountNotActivatedError';

export const postSignUp: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new RequestValidationError(errors.array());
        }

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
                activationToken as string,
                dbClient
            );
        } catch (e) {
            console.log(e);
            helperModel.rollbackTransaction(dbClient);
            throw new UnexpectedError();
        }

        await helperModel.commitTransaction(dbClient);

        const activationLink =
            `http://${req.get('host')}` +
            `/auth/activate-account/${activationToken}`;

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

        const tokenDBEntry = await authModel.getActivationTokenEntry(
            activationToken
        );

        if (!tokenDBEntry) {
            throw new CustomValidationError({
                message: 'Invalid activation token',
                field: 'activationToken',
            });
        } else if (new Date() > new Date(tokenDBEntry.expires_at)) {
            throw new CustomValidationError({
                message: 'The activationToken has expired',
                field: 'activationToken',
            });
        }

        await authModel.activateAccount(tokenDBEntry.user_id);
        res.status(200).json({ msg: 'The account has been activated' });
    }
);

export const postSignIn: RequestHandler<
    {},
    { API_KEY: string },
    { login: string; password: string }
> = asyncHandler(
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new RequestValidationError(errors.array());
        }

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

        res.status(200).json({
            API_KEY: await authModel.generateAPIKey(userId),
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
    {},
    {},
    { state: string; code: string }
> = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

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
            .then(({ rows }) => rows[0].id);

        responseStatus = 201;
    }

    // if we make it here, the user is already signed up, so just sign them in
    res.status(responseStatus).json({
        API_KEY: await authModel.generateAPIKey(userId as number),
    });
});

// query
export const isEmailAvailable: RequestHandler<
    {},
    {},
    {},
    { email: string } // defining req.query
> = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    const email = req.query.email;

    res.json({
        isEmailAvailable: await authModel.isEmailAvailable(email),
    });
});
