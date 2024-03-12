import { Request, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import OrderModel from '../models/order.js';
import * as cartModel from '../models/cart.js';
import * as redisCartModel from '../models/cart-redis.js';
import * as postgresCartModel from '../models/cart-postgres.js';
import * as transactionModel from '../models/pg-transaction.js';
import * as productModel from '../models/product.js';
import * as signupModel from '../models/signup.js';
import UnexpectedError from '../errors/UnexpectedError.js';
import dbPool from '../services/postgres.service.js';
import CheckOrderFeasabilityReqBody from '../interfaces/CheckOrderFeasabilityReqBody.js';
import { generateStrongPassword } from '../models/signup.js';
import CreateOrderReqBodyNoAuth from '../interfaces/CreateOrderReqBodyNoAuth.js';
import CreateOrderReqBodyWithAuth from '../interfaces/CreateOrderReqBodyWithAuth.js';
import { sendEmail } from '../services/email.service.js';
import OrderRecipient from '../interfaces/OrderRecipient.js';
import CombinedOutOfStockAndMaxQuantityError from '../errors/CombinedOutOfStockAndMaxQuantityError.js';
import MissingCartItemsError from '../errors/MissingCartItemsError.js';
import { base64Encode } from '../util/base64.js';
import LiqpayDecodedData from '../interfaces/LiqpayDecodedData.js';
import CamelCaseProperties from '../interfaces/CamelCaseProperties.js';

export const checkOrderFeasability: RequestHandler<
    unknown,
    unknown,
    CheckOrderFeasabilityReqBody
> = asyncHandler(async (req, res, next) => {
    res.json(await productModel.canProductsBeOrdered(req.body));
});

export const getOrderRecipients: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const orderModel = new OrderModel();
        res.json({
            orderRecipients: await orderModel.getOrderRecipients(req.user!.id),
        });
    }
);

export const createOrder: RequestHandler = asyncHandler(
    async (
        req: Request<
            unknown,
            unknown,
            CreateOrderReqBodyNoAuth | CreateOrderReqBodyWithAuth
        >,
        res,
        next
    ) => {
        let userId: number | null = req.user?.id || null;
        const isAuthenticated = userId !== null;

        if (
            isAuthenticated &&
            (await cartModel.countCartItems(userId!, false)) === 0
        ) {
            throw new MissingCartItemsError();
        }

        if (
            isAuthenticated &&
            !(await cartModel.canAtLeastOneCartProductBeOrdered(userId!))
        ) {
            throw new CombinedOutOfStockAndMaxQuantityError();
        }

        const { firstName, lastName, phoneNumber } = req.body;

        // it's necessary to use a separate database connection for a transaction
        const dbClient = await dbPool.connect();
        const orderModel = new OrderModel(dbClient);
        await transactionModel.beginTransaction(dbClient);

        try {
            let newPassword: string | null = null;

            // if an anonymous user made a request to create an order, sign this user up
            if (!isAuthenticated) {
                const { email, firstName, lastName } =
                    req.body as CreateOrderReqBodyNoAuth;

                newPassword = generateStrongPassword();
                userId = await signupModel.signUpUser({
                    email,
                    firstName,
                    lastName,
                    // this account will be activated immediately because the user would still need to go the specified email to get the password to this account
                    isActivated: true,
                    hashedPassword: await signupModel.hashPassword(newPassword),
                    dbClient,
                });
            }

            const orderRecipient: OrderRecipient = {
                userId: userId!,
                firstName,
                lastName,
                phoneNumber,
            };

            let recipientId: number | null = null;
            // if the user is anonymous, there's no chance there is a saved order recipient in the DB
            // this is because if the user is anonymous, their account was created a couple of moments ago
            if (isAuthenticated) {
                recipientId = await orderModel.getOrderRecipientId(
                    orderRecipient
                );
            }

            if (recipientId === null) {
                recipientId = await orderModel.addOrderRecipient(
                    orderRecipient
                );
            }

            const orderId = await orderModel.createOrder(
                recipientId,
                req.body.paymentMethod,
                req.body.city,
                req.body.deliveryWarehouse
            );

            if (!isAuthenticated) {
                // if the user is anonymous, they must provide a list of products that they want to order
                // the "associateProductsWithOrder" function will add the provided products to the 'orders_products' DB table
                await orderModel.associateProductsWithOrder(
                    orderId,
                    (req.body as CreateOrderReqBodyNoAuth).orderProducts
                );
            } else {
                // if the user is authenticated, the cart products are already in the DB,
                // so we just copy them to the 'orders_products' table
                await orderModel.copyCartProductsToOrderProducts(
                    userId!,
                    orderId
                );
                await cartModel.cleanCart(userId!, dbClient);
            }

            const email: string = isAuthenticated
                ? req.user!.email
                : (req.body as CreateOrderReqBodyNoAuth).email;

            const orderSummary = await orderModel.getOrderSummary(orderId);

            // after creating the order it's important to decrease the stock balance of ordered products
            await productModel.decreaseProductsStock(
                orderSummary.orderProducts.map((orderProduct) => ({
                    productId: orderProduct.productId,
                    quantity: orderProduct.orderQuantity,
                })),
                dbClient
            );

            // invalidating the Redis cache storing user carts that have at least one product ID that is in the order that we are trying to create now
            await redisCartModel.cleanCart(
                await postgresCartModel.getUserIdsWithProductInOrder(
                    orderId,
                    dbClient
                )
            );

            if (!isAuthenticated) {
                // this message will only be used inside this endpoint, so there's no point in creating a separate file for this email message
                await sendEmail(
                    email,
                    '[onlineStore] Дані про новостворений акаунт',
                    `
                    <p>Оскільки Ви щойно створили замовлення, не пройшовши автентифікацію, для Вас був створений новий обліковий запис. Ви можете використовувати цей обліковий запис для відстеження замовлення.</p>
                    <p><b>Тимчасові дані для акаунту:</b></p>
                    <ul>
                        <li>Логін: ${email}</li> 
                        <li>Пароль: ${newPassword}</li>
                    </ul>
                    <p>Якщо Ви бажаєте змінити пароль, перейдіть, будь ласка, за наступним <a href="http://${req.get(
                        'host'
                    )}/auth/forgot-password">посиланням</a>.</p>
                    `
                );
            }

            const isPayingNow = req.body.paymentMethod === 'Оплатити зараз';

            // we are passing data to this function because otherwise we would need to make unnecessary SQL requests, which would delay the response
            const response = isPayingNow
                ? orderModel.createLiqPayFormData({
                      orderInfo: {
                          orderId,
                          recipientFirstName: orderRecipient.firstName,
                          recipientLastName: orderRecipient.lastName,
                          totalPrice: orderSummary.totalPrice,
                      },
                      userId: userId!,
                  })
                : { orderId };

            if (!isPayingNow) {
                // if the user is paying now, the order confirmation email will only be sent after the order is paid for
                await orderModel.sendOrderConfirmationEmail({
                    email,
                    phoneNumber,
                    orderSummary,
                });
                await orderModel.notifyAboutOrderByTelegram(orderId);
            }

            await transactionModel.commitTransaction(dbClient);

            res.status(201).json(response);
        } catch (e) {
            // if anything goes wrong, roll back the transaction
            await transactionModel.rollbackTransaction(dbClient);
            console.log(e);
            throw new UnexpectedError();
        } finally {
            // we must release the connection to avoid resource leaks
            dbClient.release();
        }
    }
);

export const postPaymentCallback: RequestHandler<
    unknown,
    unknown,
    { data: CamelCaseProperties<LiqpayDecodedData> }
> = asyncHandler(async (req, res, next) => {
    // if we make it here, it means the "signature" is valid for the provided "data" parameter
    // we validated the signature using 'express-validator' (see routes/order.ts)
    const redirectToClient = (
        status: 'success' | 'failure' | 'cancel' | 'already paid'
    ) => {
        const response = { status };
        res.redirect(
            `${
                process.env.REACT_APP_URL
            }/user/order/callback?res=${base64Encode(JSON.stringify(response))}`
        );
    };

    const paymentInfo = req.body.data;

    // checking order payment status without establishing a long-running transaction
    if (await new OrderModel().isOrderPaidFor(paymentInfo.orderId)) {
        return redirectToClient('already paid');
    } else if (
        // every order payment must have 'action' set to 'pay'
        paymentInfo.action !== 'pay'
    ) {
        return redirectToClient('failure');
    }

    const dbClient = await dbPool.connect();
    await transactionModel.beginTransaction(dbClient);
    const orderModel = new OrderModel(dbClient);
    const orderId: number = paymentInfo.orderId;

    // this function cancels the order and returns the stock levels to the original state
    // use it only in appropriate circumstances
    const orderCancellationCleanup = async (orderId: number) => {
        await orderModel.cancelOrder(orderId);
        await productModel.restoreProductStocks(orderId, dbClient);
        await transactionModel.commitTransaction(dbClient);
    };

    try {
        if (
            // if the payment was cancelled
            paymentInfo.errCode === 'cancel'
        ) {
            await orderCancellationCleanup(orderId);
            return redirectToClient('cancel');
        } else if (
            // if the payment fails
            paymentInfo.status !== 'success'
        ) {
            await orderCancellationCleanup(orderId);
            // we will provide a vague error on purpose so that users can't create fake transactions
            return redirectToClient('failure');
        }

        // if we make it here, the payment was successful and the order should be marked as paid
        await orderModel.markOrderAsPaid(orderId);
        await orderModel.sendOrderConfirmationEmail({ orderId });
        await orderModel.notifyAboutOrderByTelegram(orderId);
        await transactionModel.commitTransaction(dbClient);

        return redirectToClient('success');
    } catch (e) {
        console.log(e);
        transactionModel.rollbackTransaction(dbClient);
        throw new UnexpectedError();
    } finally {
        dbClient.release();
    }
});
