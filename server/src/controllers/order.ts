import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import crypto from 'crypto';

import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';

import * as orderModel from '../models/order';
import * as cartModel from '../models/cart';
import * as helperModel from '../models/helper';

export const createOrder: RequestHandler = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors);
    }

    const userId: number = (req.user as VerifiedUserInfo).id;

    try {
        await helperModel.beginTransaction();

        const orderId: number = await orderModel.createOrder(
            userId,
            req.body.deliveryMethodName,
            req.body.paymentMethodName,
            req.body.postOffice,
            req.body.cityName
        );

        await orderModel.transferCartProductsToOrderProducts(userId, orderId);
        
        if (req.body.paymentMethodName === 'Оплата при отриманні товару') {
            await orderModel.notifyAboutOrderByTelegram(orderId);
        }

        await cartModel.cleanCart(userId);

        await helperModel.commitTransaction();

        res.status(201).json({ orderId });
    } catch (e) {
        await helperModel.rollbackTransaction();

        if (e === 'OrderCreationError: User cart is empty') {
            // you can't create an order if there's nothing to order
            return res.status(422).json({
                error: 'The user cart is empty'
            });
        }

        res.status(500).json({
            error: 'An unexpected error occurred while creating an order'
        });
    }
};

// this returns "data" and "signature" for LiqPay
// more: https://www.liqpay.ua/en/documentation/data_signature
export const getLiqpayFormData: RequestHandler = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors);
    }

    const orderId = +req.params.orderId;
    const username = await orderModel.getFirstAndLastNameByOrderId(orderId);

    const data = Buffer.from(
        JSON.stringify(
            {
                version: 3,
                public_key: process.env.LIQPAY_PUBLIC_KEY,
                action: 'pay',
                amount: await orderModel.getOrderPriceByOrderId(orderId),
                currency: 'UAH',
                description:
                    `Оплата ордеру №${orderId}.\n` +
                    `Ордер створив(-ла): ${username}`,
                order_id: orderId,
                result_url: `http://localhost:3000/user/order/callback`
            }
        )
    ).toString('base64');

    res.json({
        data,
        signature: orderModel.createLiqPaySignature(
            process.env.LIQPAY_PRIVATE_KEY +
            data +
            process.env.LIQPAY_PRIVATE_KEY
        )
    });
};

export const postPaymentCallback: RequestHandler = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors);
    }

    // if we make it here, it means the user paid for the product

    // req.params.orderId will be a number, but wrapped inside a string
    // we made sure about it using express-validator (see routes/order.ts) 
    const orderId: number = req.body.orderId;

    await orderModel.markOrderAsPaid(orderId);

    orderModel.notifyAboutOrderByTelegram(orderId);

    res.sendStatus(204);
};
