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

export default controllers;
