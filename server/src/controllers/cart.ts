import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import VerifiedUserInfo from '../interfaces/VerifiedUserInfo.js';
import * as cartModel from '../models/cart.js';
import CartEntry from '../interfaces/CartEntry.js';

// if the user made it to any of these middlewares,
// it means he/she is authenticated, so req.user is prepopulated

export const getUserCart: RequestHandler<
    unknown,
    { products: CartEntry[] }
> = async (req, res, next) => {
    res.json({
        products: await cartModel.getUserCart(
            (req.user as VerifiedUserInfo).id
        ),
    });
};

export const getCartItemCount: RequestHandler<
    unknown,
    { cartItemCount: number }
> = async (req, res, next) => {
    res.json({
        cartItemCount: await cartModel.countCartItems(
            (req.user as VerifiedUserInfo).id
        ),
    });
};

export const addProductToCart: RequestHandler<
    {},
    {},
    { productId: number; quantity: number } // req.body
> = asyncHandler(async (req, res, next) => {
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
    await cartModel.deleteProductFromCart(
        (req.user as VerifiedUserInfo).id,
        +req.params.productId
    );

    res.sendStatus(204);
});
