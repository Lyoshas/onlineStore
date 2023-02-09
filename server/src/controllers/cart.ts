import { RequestHandler, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';

import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';
import * as cartModel from '../models/cart';
import RequestValidationError from '../errors/RequestValidationError';

// if the user made it to any of these middlewares,
// it means he/she is authenticated, so req.user is prepopulated

export const getUserCart: RequestHandler = async (req, res, next) => {
    res.json(await cartModel.getUserCart((req.user as VerifiedUserInfo).id));
};

export const addProductToCart: RequestHandler<
    {},
    {},
    { productId: number; quantity: number } // req.body
> = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    await cartModel.addProductToCart(
        (req.user as VerifiedUserInfo).id,
        req.body.productId,
        req.body.quantity
    );

    res.sendStatus(204);
});

export const deleteProductFromCart: RequestHandler<{
    productId: string;
}> = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    await cartModel.deleteProductFromCart(
        (req.user as VerifiedUserInfo).id,
        +req.params.productId
    );

    res.sendStatus(204);
});
