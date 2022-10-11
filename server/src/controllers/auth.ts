import { validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';

import Controller from '../interfaces/Controller';
import * as authModel from '../models/auth';

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

        await authModel.signUpUser(
            firstName,
            lastName,
            email,
            await bcryptjs.hash(plainPassword, 12),
            phoneNumber
        );

        res.status(201).json({
            msg: 'A new account has been created'
        });
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
};

export default controllers;
