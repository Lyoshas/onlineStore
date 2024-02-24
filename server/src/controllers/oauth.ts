import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import bcryptjs from 'bcryptjs';

import * as userModel from '../models/user.js';
import * as oauthModel from '../models/oauth.js';
import * as signupModel from '../models/signup.js';
import { generateAccessToken } from '../models/access-token.js';
import * as refreshTokenModel from '../models/refresh-token.js';
import CustomValidationError from '../errors/CustomValidationError.js';
import UnexpectedError from '../errors/UnexpectedError.js';
import OAuthUserData from '../interfaces/OAuthUserData.js';
import { generateRandomString } from '../util/generateRandomString.js';

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

    const authServerName = await oauthModel.getAuthorizationServerNameByState(
        state
    );

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
        userId = (await signupModel
            .signUpUser({
                firstName,
                lastName,
                email,
                password: await bcryptjs.hash(
                    signupModel.generateStrongPassword(),
                    12
                ),
                isActivated: true,
            })
            .then(({ rows }) => rows[0].id)) as number;

        responseStatus = 201;
    }

    const { refreshToken, expiresAt } =
        await refreshTokenModel.generateRefreshToken(userId);

    refreshTokenModel.attachRefreshTokenAsCookie(res, refreshToken, expiresAt);

    // if we make it here, the user is already signed up, so just sign them in
    res.status(responseStatus).json({
        accessToken: await generateAccessToken(userId),
    });
});
