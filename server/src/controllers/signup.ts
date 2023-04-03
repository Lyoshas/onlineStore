import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';
import bcryptjs from 'bcryptjs';

import * as transactionModel from '../models/pg-transaction';
import * as signupModel from '../models/signup';
import * as accountActivationModel from '../models/account-activation';
import { addTokenToRedis } from '../models/redis-utils';
import { generateRandomString } from '../util/generateRandomString';
import { sendEmail } from '../services/email.service';
import dbPool from '../services/postgres.service';
import UnexpectedError from '../errors/UnexpectedError';

export const postSignUp: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const {
            firstName,
            lastName,
            email,
            password: plainPassword,
            phoneNumber,
        } = req.body;

        const activationToken = await generateRandomString(32);

        // You must use the same client instance for all statements within a transaction.
        // PostgreSQL isolates a transaction to individual clients.
        // This means if you initialize or use transactions with the pool.query method you will have problems.
        // Do not use transactions with the pool.query method.
        // more: https://node-postgres.com/features/transactions
        const dbClient = await dbPool.connect();

        await transactionModel.beginTransaction(dbClient);

        try {
            const insertedId = await signupModel
                .signUpUser({
                    firstName,
                    lastName,
                    email,
                    password: await bcryptjs.hash(plainPassword, 12),
                    phoneNumber,
                    // it's necessary to make the request using this client because transactions should be performed within a single client
                    dbClient,
                })
                .then(({ rows }) => rows[0].id);

            await addTokenToRedis({
                tokenType: 'activationToken',
                token: activationToken,
                userId: insertedId,
                expirationTimeInSeconds:
                    +process.env.ACTIVATION_TOKEN_EXPIRATION_IN_SECONDS!,
            });
        } catch (e) {
            console.log(e);
            transactionModel.rollbackTransaction(dbClient);
            throw new UnexpectedError();
        }

        await transactionModel.commitTransaction(dbClient);

        const activationLink =
            accountActivationModel.generateAccountActivationLink(
                req.get('host')!,
                activationToken
            );

        sendEmail(
            email,
            '[onlineStore] Підтвердження email',
            `
                <p>Дякуємо за реєстрацію!</p>
                <p>Будь ласка, перейдіть за посиланням для підтвердження електронної пошти:</p>
                <a href="${activationLink}">${activationLink}</a>
            `
        );

        res.status(201).json({
            msg: 'A new account has been created. Email confirmation is required.',
        });
    }
);

export const isEmailAvailable: RequestHandler<
    {},
    {},
    {},
    { email: string } // defining req.query
> = asyncHandler(async (req, res, next) => {
    const email = req.query.email;

    res.json({
        isEmailAvailable: await signupModel.isEmailAvailable(email),
    });
});
