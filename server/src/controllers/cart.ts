import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import VerifiedUserInfo from '../interfaces/VerifiedUserInfo.js';
import * as cartModel from '../models/cart.js';
import * as productModel from '../models/product.js';
import CartEntry from '../interfaces/CartEntry.js';
import { getProduct } from '../models/product.js';
import TooManyProductsInCartError from '../errors/TooManyProductsInCartError.js';
import arrayDifference from '../util/arrayDifference.js';
import UnexpectedError from '../errors/UnexpectedError.js';

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
            (req.user as VerifiedUserInfo).id,
            true
        ),
    });
};

export const upsertProductToCart: RequestHandler<
    {},
    {},
    { productId: number; quantity: number } // req.body
> = asyncHandler(async (req, res, next) => {
    const userId = req.user!.id;
    const uniqueCartProductIDs = await cartModel.getCartProductIDs(userId);

    // if the user is trying to add a new product to the cart AND the user is trying to exceed the maximum limit of cart products
    if (
        !uniqueCartProductIDs.includes(req.body.productId) &&
        uniqueCartProductIDs.length >= +process.env.MAX_PRODUCTS_IN_CART!
    ) {
        throw new TooManyProductsInCartError();
    }

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

// this controller method allows users to send their local cart (localStorage) and persist it in the DB
// if a user already has some cart products in the DB, only new products will be added there
export const synchronizeLocalCartWithAPI: RequestHandler<
    unknown,
    void,
    // req.body: [{ productId1: quantityInStock1 }, { productId2: quantityInStock2 }]
    { productId: number; quantity: number }[]
> = asyncHandler(async (req, res, next) => {
    function sendSuccessfulResponse() {
        res.sendStatus(204);
    }
    // creating a lookup table that looks like this:
    // { productId1: quantity1, productId2: quantity2 }
    // this will allow us to quickly get a quantity for a specified product ID
    const lookupReqBody: { [productId: number]: number | undefined } =
        req.body.reduce(
            (acc, elem) => ({ ...acc, [elem.productId]: elem.quantity }),
            {}
        );

    // this controller method assumes that the user is authenticated
    const userId = req.user!.id;
    const cartProductIDs = await cartModel.getCartProductIDs(userId);

    // find out which product IDs aren't in the user's cart
    const productsToCheck: number[] = arrayDifference(
        // provided product IDs:
        Object.keys(lookupReqBody).map((productId) =>
            Number(productId)
        ) as number[],
        // product IDs in the user's cart
        cartProductIDs
    );

    if (productsToCheck.length === 0) return sendSuccessfulResponse();

    // now we need to check which of the remaining products actually exist AND which of them don't exceed the quantity in stock
    const productsLimitations = await productModel.getLimitationsForProducts(
        productsToCheck
    );

    // stores products that will be added to the cart
    // products will be added here only if they aren't already in the cart AND if there are enough products in stock
    const finalCartProducts: { productId: number; quantityInCart: number }[] =
        [];

    productsLimitations.forEach((productLimitations) => {
        const { productId, quantityInStock, maxOrderQuantity } =
            productLimitations;

        const userQuantityInCart: number = lookupReqBody[productId]!;
        if (
            // if the provided product quantity doesn't exceed the quantity in stock and the maximum items per order
            userQuantityInCart <= quantityInStock &&
            userQuantityInCart <= maxOrderQuantity
        ) {
            finalCartProducts.push({
                productId,
                quantityInCart: userQuantityInCart,
            });
        }
    });

    // now that we've determined which products will be added to the cart,
    // we need to check whether the user is trying to add more products to the cart than the specified limit
    // if that's the case, throw an error
    if (
        // how many products are already in the cart + how many products can be added potentially
        cartProductIDs.length + finalCartProducts.length >
        +process.env.MAX_PRODUCTS_IN_CART!
    ) {
        throw new TooManyProductsInCartError();
    }

    if (finalCartProducts.length > 0) {
        // inserts new cart products into both Postgres and Redis
        await cartModel.bulkInsert(userId, finalCartProducts);
    }

    sendSuccessfulResponse();
});

// returns the maximum number of items that the user is allowed to have in the cart
// this endpoint is necessary for the frontend application to implement a feature that makes it possible to work with the local cart
export const getMaxProductsInCart: RequestHandler = (req, res) => {
    const maxProductsInCart = +process.env.MAX_PRODUCTS_IN_CART!;

    // this error is very unlikely and is included just in case
    if (Number.isNaN(maxProductsInCart)) {
        throw new UnexpectedError();
    }

    res.json({ maxProductsInCart });
};
