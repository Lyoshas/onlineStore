import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import VerifiedUserInfo from '../interfaces/VerifiedUserInfo.js';
import * as orderModel from '../models/order.js';
import * as cartModel from '../models/cart.js';
import * as transactionModel from '../models/pg-transaction.js';
import * as productModel from '../models/product.js';
import EmptyCartError from '../errors/EmptyCartError.js';
import UnexpectedError from '../errors/UnexpectedError.js';
import dbPool from '../services/postgres.service.js';
import CheckOrderFeasabilityReqBody from '../interfaces/CheckOrderFeasabilityReqBody.js';

export const checkOrderFeasability: RequestHandler<
    unknown,
    unknown,
    CheckOrderFeasabilityReqBody
> = asyncHandler(async (req, res, next) => {
    res.json(await productModel.canProductsBeOrdered(req.body));
});

export const getOrderRecipients: RequestHandler = asyncHandler(
    async (req, res, next) => {
        res.json({
            orderRecipients: await orderModel.getOrderRecipients(req.user!.id),
        });
    }
);

export const createOrder: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const userId: number = (req.user as VerifiedUserInfo).id;

        // You must use the same client instance for all statements within a transaction.
        // PostgreSQL isolates a transaction to individual clients.
        // This means if you initialize or use transactions with the pool.query method you will have problems.
        // Do not use transactions with the pool.query method.
        // more: https://node-postgres.com/features/transactions
        const dbClient = await dbPool.connect();

        try {
            await transactionModel.beginTransaction(dbClient);

            const orderId: number = await orderModel.createOrder(
                userId,
                req.body.deliveryMethodName,
                req.body.paymentMethodName,
                req.body.postOffice,
                req.body.cityName,
                dbClient
            );

            await orderModel.transferCartProductsToOrderProducts(
                userId,
                orderId,
                dbClient
            );

            if (req.body.paymentMethodName === 'Оплата при отриманні товару') {
                await orderModel.notifyAboutOrderByTelegram(orderId);
            }

            await cartModel.cleanCart(userId, dbClient);

            await transactionModel.commitTransaction(dbClient);

            res.status(201).json({ orderId });
        } catch (e) {
            await transactionModel.rollbackTransaction(dbClient);

            if (e === 'OrderCreationError: User cart is empty') {
                // you can't create an order if there's nothing to order
                throw new EmptyCartError();
            }

            throw new UnexpectedError();
        } finally {
            // we must release the connection to avoid resource leaks
            dbClient.release();
        }
    }
);

export const postPaymentCallback: RequestHandler = asyncHandler(
    async (req, res, next) => {
        // if we make it here, it means the user paid for the product

        // req.params.orderId will be a number, but wrapped inside a string
        // we made sure about it using express-validator (see routes/order.ts)
        const orderId: number = req.body.orderId;

        await orderModel.markOrderAsPaid(orderId);

        orderModel.notifyAboutOrderByTelegram(orderId);

        res.sendStatus(204);
    }
);
