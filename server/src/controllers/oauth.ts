import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import UserModel from '../models/user.js';
import SignupModel from '../models/signup.js';
import { generateAccessToken } from '../models/access-token.js';
import RefreshTokenModel from '../models/refresh-token.js';
import CustomValidationError from '../errors/CustomValidationError.js';
import UnexpectedError from '../errors/UnexpectedError.js';
import OAuthUserData from '../interfaces/OAuthUserData.js';
import { generateRandomString } from '../util/generateRandomString.js';
import OAuthModel from '../models/oauth.js';
import dbPool from '../services/postgres.service.js';
import * as transactionModel from '../models/pg-transaction.js';

export const getURLToOAuthAuthorizationServer: RequestHandler = asyncHandler(
    async (req, res, next) => {
        // this model can't be used inside transactions
        // to use a transaction, obtain a DB client and pass it like this: "new OAuthModel(dbClient)"
        const oauthModel = new OAuthModel();

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

        const state = (await generateRandomString(32)) as string;
        const authorizationServerId =
            await oauthModel.getAuthorizationServerIdByName(
                authorizationServerName
            );

        if (authorizationServerId === null) {
            throw new UnexpectedError(
                'Unexpected error occurred while retrieving the authorization server id'
            );
        }

        await oauthModel.addOAuthStateToDB(state, authorizationServerId);

        res.status(200).json({
            URL:
                authorizationServerName === 'google'
                    ? oauthModel.getURLToGoogleAuthorizationServer(state)
                    : oauthModel.getURLToFacebookAuthorizationServer(state),
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

    const dbClient = await dbPool.connect();
    await transactionModel.beginTransaction(dbClient);
    const oauthModel = new OAuthModel(dbClient);
    const userModel = new UserModel(dbClient);
    const signupModel = new SignupModel(dbClient);
    const refreshTokenModel = new RefreshTokenModel(dbClient);

    try {
        const authServerName =
            await oauthModel.getAuthorizationServerNameByState(state);

        if (!authServerName) {
            throw new CustomValidationError({
                message: 'Invalid "state" parameter',
                field: 'state',
            });
        }

        await oauthModel.deleteOAuthState(state);

        let userData: OAuthUserData;

        if (authServerName === 'google') {
            const idToken = await oauthModel.getGoogleIdToken(
                process.env.GOOGLE_CLIENT_ID as string,
                process.env.GOOGLE_CLIENT_SECRET as string,
                code,
                'authorization_code',
                process.env.OAUTH_REDIRECT_URI as string
            );

            userData = oauthModel.getUserDataFromGoogleIdToken(idToken);
        } else if (authServerName === 'facebook') {
            userData = await oauthModel.getUserDataFromFacebookAccessToken(
                await oauthModel.getFacebookAccessTokenByCode(code)
            );
        } else {
            throw new UnexpectedError('Invalid authorization server name');
        }

        const { firstName, lastName, email } = userData;

        // check if the user is signed up with userModel.getUserIdByEmail
        let userId = await userModel.getUserIdByEmail(email);
        let responseStatus: number = 200;

        if (userId === null) {
            // the user is new, so perform a signup
            userId = await signupModel.signUpUser({
                firstName,
                lastName,
                email,
                hashedPassword: await SignupModel.hashPassword(
                    SignupModel.generateStrongPassword()
                ),
                isActivated: true,
            });

            responseStatus = 201;
        }

        const { refreshToken, expiresAt } =
            await refreshTokenModel.generateRefreshToken(userId);

        RefreshTokenModel.attachRefreshTokenAsCookie(
            res,
            refreshToken,
            expiresAt
        );

        const accessToken = await generateAccessToken(userId, dbClient);

        // throw new Error('hello');
        await transactionModel.commitTransaction(dbClient);

        // if we make it here, the user is already signed up, so just sign them in
        res.status(responseStatus).json({ accessToken });
    } catch (e) {
        await transactionModel.rollbackTransaction(dbClient);
        throw e;
    } finally {
        dbClient.release();
    }
});
