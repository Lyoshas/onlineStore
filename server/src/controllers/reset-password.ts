import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import bcryptjs from 'bcryptjs';

import * as userModel from '../models/user';
import * as authModel from '../models/auth';
import * as helperModel from '../models/helper';
import CustomValidationError from '../errors/CustomValidationError';
import dbPool from '../util/database';
import UnexpectedError from '../errors/UnexpectedError';

// this route sends a so-called "reset token"
// it will be used to reset the user's password
// for this, "email" and "recaptchaToken" are needed in the request body
export const sendResetTokenToEmail: RequestHandler<
    {},
    { msg: string },
    { email: string; recaptchaToken: string }
> = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const userId = await userModel.getUserIdByEmail(email);

    if (userId === null) {
        throw new CustomValidationError({
            message: 'There is no user with the corresponding email',
            field: 'email',
        });
    }

    const resetToken = await userModel.generateRandomString(32);
    await authModel.addTokenToRedis({
        tokenType: 'resetToken',
        token: resetToken,
        userId,
        expirationTimeInSeconds:
            +process.env.RESET_TOKEN_EXPIRATION_IN_SECONDS!,
    });

    const resetLink = authModel.generateResetPasswordLink(
        req.get('host')!,
        resetToken
    );

    userModel.sendEmail(
        email,
        '[onlineStore] Змінення пароля',
        `
            <p>Ви запросили посилання для змінення пароля.</p>
            <p>Будь ласка, перейдіть за посиланням:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>Це посилання дійсне лише протягом 1 години.</p>
        `
    );

    res.status(200).json({
        msg: 'The link has been sent to the corresponding email',
    });
});

export const changePassword: RequestHandler<
    {},
    { msg: string },
    { resetToken: string; password: string }
> = asyncHandler(async (req, res, next) => {
    const { resetToken } = req.body;
    const userId = await authModel.getUserIdByResetToken(resetToken);

    if (!userId) {
        throw new CustomValidationError({
            message: 'resetToken is either invalid or has expired',
            field: 'resetToken',
        });
    }

    const client = await dbPool.connect();

    try {
        // The operation of changing the password and revoking the resetToken cannot be performed separately, so a transaction is required.
        // Either both operations are successful, or none of them are persisted
        await helperModel.beginTransaction(client);

        await authModel.changePassword(
            userId,
            await bcryptjs.hash(req.body.password, 12),
            client
        );

        await authModel.revokeResetToken(resetToken);

        await helperModel.commitTransaction(client);

        res.status(200).json({ msg: 'The password has been changed.' });
    } catch (e) {
        await helperModel.rollbackTransaction(client);
        throw new UnexpectedError('Something went wrong');
    }
});

export const isResetTokenValid: RequestHandler<
    { resetToken: string },
    { isValid: boolean }
> = asyncHandler(async (req, res, next) => {
    const userId = await authModel.getUserIdByResetToken(req.params.resetToken);

    res.status(200).json({ isValid: userId !== null });
});
