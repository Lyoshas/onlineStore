import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';

import * as orderModel from '../models/order';
import * as cartModel from '../models/cart';
import * as helperModel from '../models/helper';
import EmptyCartError from '../errors/EmptyCartError';
import UnexpectedError from '../errors/UnexpectedError';
import dbPool from '../util/database';

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
            await helperModel.beginTransaction(dbClient);

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

            await helperModel.commitTransaction(dbClient);

            res.status(201).json({ orderId });
        } catch (e) {
            await helperModel.rollbackTransaction(dbClient);

            if (e === 'OrderCreationError: User cart is empty') {
                // you can't create an order if there's nothing to order
                throw new EmptyCartError();
            }

            throw new UnexpectedError();
        }
    }
);

// this returns "data" and "signature" for LiqPay
// more: https://www.liqpay.ua/en/documentation/data_signature
export const getLiqpayFormData: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const orderId = +req.params.orderId;
        const username = await orderModel.getFirstAndLastNameByOrderId(orderId);

        const data = Buffer.from(
            JSON.stringify({
                version: 3,
                public_key: process.env.LIQPAY_PUBLIC_KEY,
                action: 'pay',
                amount: await orderModel.getOrderPriceByOrderId(orderId),
                currency: 'UAH',
                description:
                    `Оплата ордеру №${orderId}.\n` +
                    `Ордер створив(-ла): ${username}`,
                order_id: orderId,
                result_url: `http://localhost:3000/user/order/callback`,
            })
        ).toString('base64');

        res.json({
            data,
            signature: orderModel.createLiqPaySignature(
                process.env.LIQPAY_PRIVATE_KEY +
                    data +
                    process.env.LIQPAY_PRIVATE_KEY
            ),
        });
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
