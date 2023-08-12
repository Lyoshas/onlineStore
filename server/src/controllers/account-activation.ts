import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import * as activationModel from '../models/account-activation.js';
import * as userModel from '../models/user.js';
import CustomValidationError from '../errors/CustomValidationError.js';
import InvalidCredentialsError from '../errors/InvalidPasswordError.js';
import AccountActivatedError from '../errors/AccountActivatedError.js';
import UnexpectedError from '../errors/UnexpectedError.js';
import { generateRandomString } from '../util/generateRandomString.js';
import { addTokenToRedis } from '../models/redis-utils.js';
import { sendEmail } from '../services/email.service.js';

export const activateAccount: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const activationToken = req.params.activationToken;

        const userId = await activationModel.getUserIdByActivationToken(
            activationToken
        );

        if (userId === null) {
            throw new CustomValidationError({
                message: 'The activation token is either invalid or expired',
                field: 'activationToken',
            });
        }

        console.log('USER_ID TYPE CHECKING!');
        console.log(userId);
        console.log(typeof userId);
        await activationModel.activateAccount(+userId);

        res.status(200).json({ msg: 'The account has been activated' });
    }
);

export const resendActivationLink: RequestHandler<
    {},
    { targetEmail: string },
    { login: string; password: string }
> = asyncHandler(async (req, res, next) => {
    const userId = await userModel.getUserIdByCredentials(
        // the login can be either a mobile phone (+380-XX-XXX-XX-XX) or an email
        req.body.login,
        req.body.password
    );

    if (userId === null) {
        throw new InvalidCredentialsError();
    }

    if (await activationModel.isAccountActivated(userId)) {
        // you can't send the activation link again if the account is already activated
        throw new AccountActivatedError();
    }

    const email = await userModel.getEmailByUserId(userId);

    if (email === null) {
        throw new UnexpectedError('Email associated with userId was not found');
    }

    const activationToken = await generateRandomString(32);
    await addTokenToRedis({
        tokenType: 'activationToken',
        token: activationToken,
        userId,
        expirationTimeInSeconds:
            +process.env.ACTIVATION_TOKEN_EXPIRATION_IN_SECONDS!,
    });

    const activationLink = activationModel.generateAccountActivationLink(
        req.get('host')!,
        activationToken
    );

    await sendEmail(
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
