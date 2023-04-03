import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import bcryptjs from 'bcryptjs';

import * as userModel from '../models/user';
import * as transactionModel from '../models/pg-transaction';
import * as resetPasswordModel from '../models/reset-password';
import { addTokenToRedis } from '../models/redis-utils';
import CustomValidationError from '../errors/CustomValidationError';
import dbPool from '../util/database';
import UnexpectedError from '../errors/UnexpectedError';
import { generateRandomString } from '../util/generateRandomString';
import { sendEmail } from '../services/email.service';

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

    const resetToken = await generateRandomString(32);
    await addTokenToRedis({
        tokenType: 'resetToken',
        token: resetToken,
        userId,
        expirationTimeInSeconds:
            +process.env.RESET_TOKEN_EXPIRATION_IN_SECONDS!,
    });

    const resetLink = resetPasswordModel.generateResetPasswordLink(
        req.get('host')!,
        resetToken
    );

    sendEmail(
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
    const userId = await resetPasswordModel.getUserIdByResetToken(resetToken);

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
        await transactionModel.beginTransaction(client);

        await resetPasswordModel.changePassword(
            userId,
            await bcryptjs.hash(req.body.password, 12),
            client
        );

        await resetPasswordModel.revokeResetToken(resetToken);

        await transactionModel.commitTransaction(client);

        res.status(200).json({ msg: 'The password has been changed.' });
    } catch (e) {
        await transactionModel.rollbackTransaction(client);
        throw new UnexpectedError('Something went wrong');
    }
});

export const isResetTokenValid: RequestHandler<
    { resetToken: string },
    { isValid: boolean }
> = asyncHandler(async (req, res, next) => {
    const userId = await resetPasswordModel.getUserIdByResetToken(
        req.params.resetToken
    );

    res.status(200).json({ isValid: userId !== null });
});
