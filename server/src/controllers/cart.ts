import { RequestHandler, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';
import * as cartModel from '../models/cart';

// if the user made it to any of these middlewares,
// it means he/she is authenticated, so req.user is prepopulated

export const getUserCart: RequestHandler = async (req, res, next) => {
    res.json(
        await cartModel.getUserCart((req.user as VerifiedUserInfo).id)
    );
};

export const addProductToCart: RequestHandler<
    {},
    {},
    { productId: number; quantity: number } // req.body
> = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors);
    }

    await cartModel.addProductToCart(
        (req.user as VerifiedUserInfo).id,
        req.body.productId,
        req.body.quantity
    );

    res.sendStatus(204);
};

export const deleteProductFromCart: RequestHandler<
    { productId: string } // req.params
> = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors);
    }

    await cartModel.deleteProductFromCart(
        (req.user as VerifiedUserInfo).id,
        +req.params.productId
    );

    res.sendStatus(204);
};
