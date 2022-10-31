import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';

import * as authModel from '../models/auth';
import * as userModel from '../models/user';
import * as helperModel from '../models/helper';
import OAuthUserData from '../interfaces/OAuthUserData';

export const postSignUp: RequestHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json(errors);
        }

        const {
            firstName,
            lastName,
            email,
            password: plainPassword,
            phoneNumber
        } = req.body;

        const activationToken = await userModel.generateToken(32);

        await helperModel.beginTransaction();

        try {
            const insertedId = await authModel.signUpUser(
                firstName,
                lastName,
                email,
                await bcryptjs.hash(plainPassword, 12),
                phoneNumber
            ).then(({ rows }) => rows[0].id);

            await authModel.addActivationTokenToDB(insertedId, activationToken as string);
        } catch (e) {
            console.log(e);
            helperModel.rollbackTransaction();
            return res.status(500).json({ error: 'An unexpected error occurred.' });
        }

        await helperModel.commitTransaction();

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
            msg: 'A new account has been created. Email confirmation is required.'
        });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
};

export const activateAccount: RequestHandler = async (req, res, next) => {
    const activationToken = req.params.activationToken;

    const tokenDBEntry = await authModel.getActivationTokenEntry(activationToken);

    if (!tokenDBEntry) {
        return res.status(422).json({ error: 'Invalid activation token' });
    } else if (new Date() > new Date(tokenDBEntry.expires_at)) {
        return res.status(422).json({ error: 'The activation token has expired' });
    }

    await authModel.activateAccount(tokenDBEntry.user_id);
    res.status(200).json({ msg: 'The account has been activated' });
};

export const postSignIn: RequestHandler = async (req, res, next) => {
    const userId = await authModel.getUserIdByCredentials(
        // the login can be either a mobile phone (+380-XX-XXX-XX-XX) or an email
        req.body.login,
        req.body.password
    );

    if (userId === null) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ API_KEY: await authModel.generateAPIKey(userId) });
};

export const getURLToOAuthAuthorizationServer: RequestHandler = async (
    req, res, next
) => {
    // for now the supported options are facebook and google
    const authorizationServerName = req.params.authorizationServerName.toLowerCase();

    if (!['google', 'facebook'].includes(authorizationServerName)) {
        return res.status(422).json({
            error: 'Invalid authorization server name: ' +
                'it can be either "google" or "facebook"'
        });
    }

    const state = await userModel.generateToken(32) as string;
    const authorizationServerId = await authModel.getAuthorizationServerIdByName(
        authorizationServerName
    );

    if (authorizationServerId === null) {
        return res.status(500).json({
            error: 'Unexpected error occurred ' +
                'while retrieving the authorization server id'
        });
    }

    await authModel.addOAuthStateToDB(state, authorizationServerId);

    return res.status(200).json({
        URL: authorizationServerName === 'google'
            ? authModel.getURLToGoogleAuthorizationServer(state)
            : authModel.getURLToFacebookAuthorizationServer(state)
    });
};

export const OAuthCallback: RequestHandler = async (req, res, next) => {
    const state = req.query.state as string;
    const code = req.query.code as string;

    const authServerName = await authModel.getAuthorizationServerNameByState(state);
    
    if (!authServerName) {
        return res.status(403).json({ error: 'Invalid "state" parameter' });
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
        return res.status(422).json({
            error: 'Unknown authorization server name'
        });
    }

    const { firstName, lastName, email, avatarURL } = userData;

    // check if the user is signed up with userModel.getUserIdByEmail 
    let userId = await userModel.getUserIdByEmail(email);
    let responseStatus: number = 200;

    if (userId === null) {
        // the user is new, so perform a signup
        userId = await authModel.signUpUser(
            firstName,
            lastName,
            email,
            await bcryptjs.hash(authModel.generateStrongPassword(), 12),
            null,
            avatarURL,
            true
        ).then(({ rows }) => rows[0].id);
        
        responseStatus = 201;
    }

    // if we make it here, the user is already signed up, so just sign them in
    res.status(responseStatus).json({
        API_KEY: await authModel.generateAPIKey(userId as number)
    });
};
