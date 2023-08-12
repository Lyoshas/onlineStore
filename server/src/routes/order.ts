import express from 'express';
import { body, param } from 'express-validator';
import fetch from 'node-fetch';

import * as orderController from '../controllers/order.js';
import * as orderModel from '../models/order.js';
import ensureAuthentication from '../middlewares/ensure-authentication.js';
import dbPool from '../services/postgres.service.js';
import validateRequest from '../middlewares/validate-request.js';

const router = express.Router();

// this checks if the specified name exists in the DB
// it's important to be careful with this function
// don't let user input get in here!
function doesThisNameExist(tableName: string, name: string): Promise<boolean> {
    if (
        ![
            'delivery_methods',
            'order_payment_methods',
            'cities'
        ].includes(tableName)
    ) {
        throw new Error(
            'Unknown tableName: it can be either ' +
            'delivery_methods, or order_payment_methods or cities'
        );
    }

    return dbPool.query(`
        SELECT EXISTS(SELECT 1 FROM ${tableName} WHERE name = $1)
    `, [name])
        .then(({ rows }) => rows[0].exists ? true : Promise.reject());
}

router.post(
    '/order',
    ensureAuthentication,
    body('phoneNumber')
        .exists()
        .withMessage('phoneNumber must be specified')
        .custom(phoneNumber => {
            if (/\+380-\d{2}-\d{3}-\d{2}-\d{2}/.test(phoneNumber)) {
                return Promise.resolve();
            }
            return Promise.reject(
                'phoneNumber must adhere to this schema: +380-XX-XXX-XX-XX'
            );
        }),
    body('deliveryMethodName')
        .exists()
        .withMessage('deliveryMethodName must be specified')
        .custom(deliveryMethodName => {
            return doesThisNameExist(
                'delivery_methods',
                deliveryMethodName
            );
        })
        .withMessage('deliveryMethodName is not correct'),
    body('paymentMethodName')
        .exists()
        .withMessage('paymentMethodName must be specified')
        .custom(paymentMethodName => {
            return doesThisNameExist(
                'order_payment_methods',
                paymentMethodName
            );
        })
        .withMessage('paymentMethodName is not correct'),
    body('cityName')
        .exists()
        .withMessage('cityName must be specified')
        .custom(cityName => {
            return doesThisNameExist('cities', cityName);
        })
        .withMessage('cityName is not correct'),
    body('postOffice')
        .exists()
        .withMessage('postOffice must be specified')
        .custom(async (postOffice, { req }) => {
            const companyName = req.body.deliveryMethodName;
            if (companyName === 'Нова Пошта') {
                const jsonResult = await fetch('https://api.novaposhta.ua/v2.0/json/', {
                    method: 'POST',
                    body: JSON.stringify({
                        apiKey: process.env.NOVA_POSHTA_API_KEY,
                        modelName: 'Address',
                        calledMethod: 'getWarehouses',
                        methodProperties: {
                            WarehouseId: postOffice,
                            CityName: req.body.cityName
                        }
                    })
                }).then(response => response.json())

                return (
                    jsonResult.data.length === 0
                        ? Promise.reject()
                        : Promise.resolve()
                );
            } else if (companyName === 'Укрпошта') {
                const jsonResult = await fetch(
                    'https://offices.ukrposhta.ua/requests/controller.php' +
                    `?method=get_postoffices_by_postindex_web&pc=${postOffice}`
                ).then(response => response.json());

                return jsonResult.error ? Promise.reject() : Promise.resolve();
            }
        })
        .withMessage('postOffice is not correct'),
    validateRequest,
    orderController.createOrder
);

async function checkOrderId(orderId: number) {
    const storedOrder = await dbPool.query(
        `
            SELECT
                o.is_paid,
                o_p_m.name AS payment_name
            FROM orders AS o
            INNER JOIN order_payment_methods AS o_p_m
                ON o.payment_method_id = o_p_m.id
            WHERE o.id = $1
        `,
        [orderId]
    ).then(({ rows }) => rows.length === 0 ? null : rows[0]);

    if (!storedOrder) {
        return Promise.reject('orderId does not exist');
    }

    if (storedOrder.payment_name !== 'Оплатити зараз') {
        return Promise.reject(
            'This order must have ' +
            'the payment_method set to "Оплатити зараз"'
        );
    }

    if (storedOrder.isPaid) {
        return Promise.reject('This order has already been paid for');
    }

    return Promise.resolve();
}

router.get(
    '/order/:orderId/payment-data/',
    param('orderId')
        .isNumeric()
        .custom(checkOrderId),
    validateRequest,
    orderController.getLiqpayFormData
);

router.post(
    '/order/callback',
    body('data')
        .custom((data, { req }) => {
            // we have to verify the signature that's in req.body
            // to do that, we need to hash this value:
            // liqpay_private_key + req.body.data + liqpay_private_key
            // and then compare the hash we've generated with the hash in req.body
            // if there's a match, the request is genuine
            if (typeof data !== 'string') {
                return Promise.reject('data must be a string');
            }

            const signature = orderModel.createLiqPaySignature(
                process.env.LIQPAY_PRIVATE_KEY +
                data +
                process.env.LIQPAY_PRIVATE_KEY
            );

            if (signature !== req.body.signature) {
                return Promise.reject('Invalid signature');
            }

            const orderId: string = JSON.parse(
                orderModel.decodeLiqPayData(data)
            ).order_id;

            req.body.orderId = orderId;
            
            return Promise.resolve();
        }),
    validateRequest,
    orderController.postPaymentCallback 
);

export default router;
