import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import VerifiedUserInfo from '../interfaces/VerifiedUserInfo.js';
import * as cartModel from '../models/cart.js';
import CartEntry from '../interfaces/CartEntry.js';
import { getProduct } from '../models/product.js';

// if the user made it to any of these middlewares,
// it means he/she is authenticated, so req.user is prepopulated

export const getUserCart: RequestHandler<
    unknown,
    { products: CartEntry[]; totalPrice: number }
> = async (req, res, next) => {
    const cartProducts = await cartModel.getUserCart(
        (req.user as VerifiedUserInfo).id
    );

    res.json({
        products: cartProducts,
        totalPrice: cartModel.getCartTotalPrice(cartProducts),
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

export const upsertProductToCart: RequestHandler<
    {},
    {},
    { productId: number; quantity: number } // req.body
> = asyncHandler(async (req, res, next) => {
    await cartModel.upsertProductToCart(
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

// this controller method processes a request to the endpoint that is used to check whether the user can add a specific quantity of products to the cart
// if the user can add the requested number of products, this controller will return { safeToAdd: true, reason: null }, otherwise { safeToAdd: false, reason: string }
// this endpoint is intended for anonymous users who have no ability to add products to the cart with API requests (using API endpoints to manipulate the cart is forbidden for anonymous users)
export const isSafeToAddProductToCart: RequestHandler<
    unknown,
    {
        safeToAdd: boolean;
        // 'InsufficientProductStock' means that there aren't enough products in stock
        // 'ExceededMaxOrderQuantity' means that one user can't add this many products to the cart. This is controlled by the 'max_order_quantity' DB attribute in each product
        // 'null' means that 'safeToAdd' is true
        reason: 'InsufficentProductStock' | 'ExceededMaxOrderQuantity' | null;
        maxOrderQuantity?: number;
    },
    unknown,
    // 'quantityToAdd 'is the specific quantity the user is trying to add to the cart
    { productId: number; quantityToAdd: number }
> = asyncHandler(async (req, res, next) => {
    const { productId, quantityToAdd } = req.query;

    const {
        quantity_in_stock: productQuantityInDB,
        max_order_quantity: maxOrderQuantityInDB,
    } = await getProduct(productId, [
        'quantity_in_stock',
        'max_order_quantity',
    ]);

    if (productQuantityInDB < quantityToAdd) {
        res.json({ safeToAdd: false, reason: 'InsufficentProductStock' });
    } else if (maxOrderQuantityInDB < quantityToAdd) {
        res.json({
            safeToAdd: false,
            reason: 'ExceededMaxOrderQuantity',
            maxOrderQuantity: maxOrderQuantityInDB,
        });
    } else {
        res.json({ safeToAdd: true, reason: null });
    }
});
