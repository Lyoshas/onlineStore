import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import bcryptjs from 'bcryptjs';

import * as userModel from '../models/user';
import * as authModel from '../models/auth';
import CustomValidationError from '../errors/CustomValidationError';
import UnexpectedError from '../errors/UnexpectedError';
import OAuthUserData from '../interfaces/OAuthUserData';

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
        userId = (await authModel
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
                withOAuth: true,
            })
            .then(({ rows }) => rows[0].id)) as number;

        responseStatus = 201;
    }

    const { refreshToken, expiresAt } = await authModel.generateRefreshToken(
        userId
    );

    authModel.attachRefreshTokenAsCookie(res, refreshToken, expiresAt);

    // if we make it here, the user is already signed up, so just sign them in
    res.status(responseStatus).json({
        accessToken: await authModel.generateAccessToken(userId),
    });
});
