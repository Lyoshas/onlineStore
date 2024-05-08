import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';

import * as orderController from '../controllers/order.js';
import OrderModel from '../models/order.js';
import ensureAuthentication from '../middlewares/ensure-authentication.js';
import validateRequest from '../middlewares/validate-request.js';
import ExceededMaxProductsToCheckError from '../errors/ExceededMaxProductsToCheckError.js';
import CustomValidationError from '../errors/CustomValidationError.js';
import { canProductsBeOrdered, productsExist } from '../models/product.js';
import SomeProductsNotFoundError from '../errors/SomeProductsNotExistError.js';
import { orderPaymentMethodExists } from '../models/order-payment-method.js';
import { doesPostalServiceWarehouseExist } from '../models/shipping.js';
import RequestValidationError from '../errors/RequestValidationError.js';
import firstNameValidation from './util/firstNameValidation.js';
import lastNameValidation from './util/lastNameValidation.js';
import { isEmailAvailable } from '../models/signup.js';
import OrderProduct from '../interfaces/OrderProduct.js';
import { combinedOutOfStockAndMaxQuantityErrorMessage } from '../errors/CombinedOutOfStockAndMaxQuantityError.js';
import { base64Decode, base64Encode } from '../util/base64.js';
import camelCaseObject from '../util/camelCaseObject.js';
import { createLiqPaySignature } from '../models/liqpay.js';
import liqpayDataValidation from './util/liqpayDataValidation.js';
import liqpaySignatureValidation from './util/liqpaySignatureValidation.js';

const router = express.Router();

router.post(
    '/order/check-feasibility',
    [
        body()
            .isArray({ min: 1 })
            .withMessage('request body must be a non-empty array'),
        // if req.body is not an array, there is no point in further validation
        validateRequest,
        body('*.productId')
            .isInt({ gt: 0 })
            .withMessage(
                'each productId must be an integer that is greater than zero'
            ),
        body('*.quantity')
            .isInt({ gt: 0 })
            .withMessage(
                'each quantity must be an integer that is greater than zero'
            ),
        validateRequest,
        asyncHandler(
            async (
                req: Request<
                    unknown,
                    unknown,
                    {
                        productId: number;
                        quantity: number;
                    }[]
                >,
                res: Response,
                next: NextFunction
            ) => {
                const productIDs: number[] = req.body.map(
                    (elem) => elem.productId
                );

                if (productIDs.length > +process.env.MAX_PRODUCTS_IN_CART!) {
                    throw new ExceededMaxProductsToCheckError();
                }

                const uniqueProductIDs = new Set(productIDs);
                if (uniqueProductIDs.size !== productIDs.length) {
                    throw new CustomValidationError({
                        message:
                            'request body must not contain duplicate product IDs',
                        field: 'req.body',
                    });
                }

                if (!(await productsExist(productIDs))) {
                    throw new SomeProductsNotFoundError();
                }

                next();
            }
        ),
    ],
    validateRequest,
    orderController.checkOrderFeasability
);

router.get(
    '/order/recipients',
    ensureAuthentication,
    orderController.getOrderRecipients
);

(function () {
    const validateOrderRequest = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        let errors = validationResult(req).array();

        // if the user is authenticated, ignore errors related to 'orderProducts' and 'email'
        if (req.user) {
            errors = errors.filter((error) => {
                return (
                    !error.param.startsWith('orderProducts') &&
                    error.param !== 'email'
                );
            });
        }

        if (errors.length > 0) {
            throw new RequestValidationError(errors);
        }

        next();
    };

    router.post(
        '/order',
        body('city')
            .isString()
            .withMessage('the field "cityName" must be a string'),
        // if "city" is invalid, don't perform any further validation
        // this is done here because further validation assumes that the "city"
        // parameter is correct
        validateRequest,
        body('deliveryWarehouse')
            .isString()
            .withMessage('the field "deliveryWarehouse" must be a string')
            .bail()
            .custom(async (deliveryWarehouse: string, { req }) => {
                const exists = await doesPostalServiceWarehouseExist(
                    req.body.city as string,
                    deliveryWarehouse
                );
                return exists ? Promise.resolve() : Promise.reject();
            })
            .withMessage(
                "the specified warehouse doesn't exist in the provided city"
            ),
        body('email')
            .isEmail()
            .withMessage('the field "email" must be a correct email address')
            .isLength({ max: 254 })
            .withMessage('the field "email" can be up to 254 characters long')
            .bail()
            .custom(async (email: string, { req }) => {
                // if the user is authenticated, the 'email' field will be ignored,
                // so there's no point in validating it
                if (req.user) {
                    return Promise.resolve();
                }

                if (!(await isEmailAvailable(email))) {
                    return Promise.reject('The email is already taken');
                }

                return Promise.resolve();
            }),
        body('phoneNumber')
            .isString()
            .withMessage('the field "phoneNumber" must be a string')
            .bail()
            .custom((phoneNumber) => {
                if (
                    /^\+380-\d{2}-\d{3}-\d{2}-\d{2}$/.test(phoneNumber) ||
                    /^\+380\d{9}$/.test(phoneNumber)
                ) {
                    return Promise.resolve();
                }
                return Promise.reject(
                    'the field "phoneNumber" must be a valid Ukrainian mobile number in format +380-12-345-67-89 or +380123456789'
                );
            })
            .customSanitizer((phoneNumber: string) => {
                // "+380123456789" => "+380-12-345-67-89" (the DB expects this format)
                return phoneNumber.replace(
                    /^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/,
                    '+380-$1-$2-$3-$4'
                );
            }),
        firstNameValidation,
        lastNameValidation,
        body('paymentMethod')
            .isString()
            .withMessage('the field "paymentMethod" must be a string')
            .bail()
            .custom(async (paymentMethod) => {
                const exists = await orderPaymentMethodExists(paymentMethod);
                return exists ? Promise.resolve() : Promise.reject();
            })
            .withMessage('the field "paymentMethod" has an unsupported value'),
        [
            body('orderProducts')
                .isArray()
                .isLength({ min: 1 })
                .withMessage(
                    'the field "orderProducts" must be an array containing at least one element'
                ),
            body('orderProducts.*.productId')
                .isInt({ gt: 0 })
                .withMessage(
                    'each productId must be an integer that is greater than zero'
                ),
            body('orderProducts.*.quantity')
                .isInt({ gt: 0 })
                .withMessage(
                    'each quantity must be an integer that is greater than zero'
                ),
            validateOrderRequest,
            body('orderProducts')
                .custom(async (orderProducts: OrderProduct[], { req }) => {
                    if (req.user) {
                        // if the user is authenticated, don't perform any further validation,
                        // because 'orderProducts' is ignored for authenticated users
                        return Promise.reject();
                    }

                    if (
                        orderProducts.length >
                        +process.env.MAX_PRODUCTS_IN_CART!
                    ) {
                        return Promise.reject(
                            `only ${process.env.MAX_PRODUCTS_IN_CART} products can be ordered per one order`
                        );
                    }

                    const productIDs: number[] = orderProducts.map(
                        (elem) => elem.productId
                    );

                    if (new Set(productIDs).size !== productIDs.length) {
                        return Promise.reject(
                            'orderProducts must not contain duplicate product IDs'
                        );
                    }

                    const allProductsExist: boolean = await productsExist(
                        orderProducts.map(
                            (orderProduct) => orderProduct.productId
                        )
                    );

                    if (!allProductsExist) {
                        return Promise.reject(
                            'some of the provided products do not exist'
                        );
                    }
                })
                .bail()
                .customSanitizer(async (orderProducts: OrderProduct[]) => {
                    // the 'canProductsBeOrdered' function returns a lookup table
                    // it specifies whether the provided products can be ordered or not
                    const products = await canProductsBeOrdered(orderProducts);

                    // if there are products that can't be ordered, ignore them
                    return orderProducts.filter(
                        (orderProduct) =>
                            products[orderProduct.productId].canBeOrdered
                    );
                })
                .isArray({ min: 1 })
                .withMessage(combinedOutOfStockAndMaxQuantityErrorMessage),
        ],
        validateOrderRequest,
        orderController.createOrder
    );
})();

router.post(
    '/order/callback',
    liqpayDataValidation,
    // if the 'data' parameter is invalid, there's no point in validating further
    validateRequest,
    liqpaySignatureValidation,
    // validating the most important fields that must be present
    validateRequest,
    body('data').customSanitizer((data: string) => {
        // transforming the 'data' parameter to an object
        return camelCaseObject(JSON.parse(base64Decode(data)));
    }),
    body('data.orderId')
        .isNumeric()
        // LiqPay returns 'orderId' as a string, so we need to transform it to a number
        .customSanitizer((orderId: string) => +orderId)
        .withMessage('must be a numeric value'),
    body('data.action').isString().withMessage('must be a string'),
    body('data.status').isString().withMessage('must be a string'),
    body('data.errCode').optional().isString().withMessage('must be a string'),
    validateRequest,
    orderController.postPaymentCallback
);

router.get('/orders', ensureAuthentication, orderController.getOrders);

export default router;
