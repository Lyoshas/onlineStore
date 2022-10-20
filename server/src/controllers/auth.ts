import { validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';

import Controller from '../interfaces/Controller';
import * as authModel from '../models/auth';
import * as userModel from '../models/user';
import * as helperModel from '../models/helper';

const controllers: Controller = {};

controllers.postSignUp = async (req, res, next) => {
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

controllers.activateAccount = async (req, res, next) => {
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

controllers.postSignIn = async (req, res, next) => {
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

controllers.getURLToGoogleAuthorizationServer = async (req, res, next) => {
    const state = await userModel.generateToken(32) as string;
    await authModel.addOAuthStateToDB(state);
    return res.status(200).json({
        URL: `
            https://accounts.google.com/o/oauth2/v2/auth
                ?client_id=${process.env.GOOGLE_CLIENT_ID}
                &redirect_uri=${process.env.GOOGLE_REDIRECT_URI}
                &scope=email%20profile
                &response_type=code
                &state=${state}
        `.replace(/\s/g, '')
    });
};

controllers.googleOAuthCallback = async (req, res, next) => {
    const state = req.query.state as string;

    if (!await authModel.isOAuthStateValid(state)) {
        return res.status(403).json({ error: 'Invalid "state" parameter' });
    }

    await authModel.deleteOAuthState(state);

    const idToken = await authModel.getGoogleIdToken(
        process.env.GOOGLE_CLIENT_ID as string,
        process.env.GOOGLE_CLIENT_SECRET as string,
        req.query.code as string,
        'authorization_code',
        process.env.GOOGLE_REDIRECT_URI as string
    );

    const {
        firstName,
        lastName,
        email,
        avatarURL
    } = authModel.getUserDataFromGoogleIdToken(idToken);

    // check if the user is signed up with userModel.getUserIdByEmail 
    const storedUserId = await userModel.getUserIdByEmail(email);

    if (storedUserId === null) {
        // the user is new, so perform a signup
        const userId: number = await authModel.signUpUser(
            firstName,
            lastName,
            email,
            await bcryptjs.hash(authModel.generateStrongPassword(), 12),
            null,
            avatarURL,
            true
        ).then(({ rows }) => rows[0].id);
        
        return res.status(201).json({
            API_KEY: await authModel.generateAPIKey(userId)
        });
    }

    // if we make it here, the user is already signed up, so just sign them in
    res.status(200).json({
        API_KEY: await authModel.generateAPIKey(storedUserId)
    });
};

export default controllers;
