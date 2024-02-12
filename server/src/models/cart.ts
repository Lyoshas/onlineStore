import { PoolClient } from 'pg';

import CartEntry from '../interfaces/CartEntry.js';
import * as postgresCartModel from './cart-postgres.js';
import * as redisCartModel from './cart-redis.js';
import CartProductSummary from '../interfaces/CartProductSummary.js';

// first, we try to get the cart from Redis
// if it fails, we get it from PostgreSQL
export const getUserCart = async (userId: number): Promise<CartEntry[]> => {
    try {
        const redisCart = await redisCartModel.getUserCart(userId);
        if (redisCart !== null) return redisCart;
    } catch (error) {
        console.error('Error fetching cart from Redis:', error);
    }

    const postgresCart = await postgresCartModel.getUserCart(userId);

    // we won't wait for this function to execute
    // it will run asynchronously
    redisCartModel.cacheUserCart(userId, postgresCart);

    return postgresCart;
};

// This function counts how many products are in the cart
// it will first try to count cart items that are stored in Redis
// if it fails, the function will fall back to using PostgreSQL
export const countCartItems = async (
    userId: number,
    // 'includeDuplicates' specifies whether the function should take duplicate
    // products into account or not
    // for example: [{ productId: 1, quantity: 5 }, { productId: 2, quantity: 15 }]
    // "includeDuplicates = true" => 20 products in the cart (incl. duplicates)
    // "includeDuplicates = false" => 2 products in the cart (excl. duplicates)
    includeDuplicates: boolean
): Promise<number> => {
    try {
        const cartItemsCountRedis = await redisCartModel.countCartItems(
            userId,
            includeDuplicates
        );

        if (cartItemsCountRedis !== null) return cartItemsCountRedis;
    } catch (error) {
        console.error('Error counting cart items in Redis:', error);
    }

    return postgresCartModel.countCartItems(userId, includeDuplicates);
};

// this function counts how many products are in the cart (excl. duplicates)
// it will first try to count cart items that are stored in Redis
// if it fails, the function will fall back to using PostgreSQL

export const getCartTotalPrice = (cartContent: CartEntry[]): number => {
    return cartContent.reduce((acc, cartProduct) => {
        // don't include cart products that are "unavailable"
        if (!cartProduct.canBeOrdered) return acc;

        return acc + Number(cartProduct.price) * Number(cartProduct.quantity);
    }, 0);
};

export const upsertProductToCart = async (
    userId: number,
    productId: number,
    quantity: number
): Promise<void> => {
    await postgresCartModel.upsertProductToCart(userId, productId, quantity);

    try {
        // if the cart cache is empty, this function won't do anything
        // because fetching the cart from Postgres and then adding a product to it would take too long
        await redisCartModel.upsertProductToCart(userId, productId, quantity);
    } catch (error) {
        console.error('Error adding a product to the cart in Redis', error);
    }
};

export const bulkInsert = async (
    userId: number,
    cartProductsSummary: CartProductSummary[]
): Promise<void> => {
    await postgresCartModel.bulkInsert(userId, cartProductsSummary);

    try {
        await redisCartModel.bulkInsert(userId, cartProductsSummary);
    } catch (error) {
        console.log('Error with bulkInsert in Redis', error);
    }
};

export const deleteProductFromCart = async (
    userId: number,
    productId: number
): Promise<void> => {
    await postgresCartModel.deleteProductFromCart(userId, productId);

    try {
        // if the cart cache is empty, this function won't do anything
        // because fetching the cart from Postgres and then deleting a product from it would take too long
        await redisCartModel.deleteProductFromCart(userId, productId);
    } catch (error) {
        console.error('Error deleting a product from the cart in Redis', error);
    }
};

export const cleanCart = async (
    userId: number,
    postgresClient?: PoolClient
) => {
    await postgresCartModel.cleanCart(userId, postgresClient);

    try {
        await redisCartModel.cleanCart(userId);
    } catch (error) {
        console.error('Error cleaning the cart in Redis', error);
    }
};

// this function should only be used if you want to check one product
// if there is more than 1 product, other strategies should be used
// otherwise PostgreSQL can potentially be overwhelmed with requests
export const isProductInTheCart = async (
    userId: number,
    productId: number
): Promise<boolean> => {
    try {
        return redisCartModel.isProductInTheCart(userId, productId);
    } catch (e) {
        console.error(e);
    }

    // if the Redis server fails, fall back to Postgres
    return postgresCartModel.isProductInTheCart(userId, productId);
};

// returns the IDs of unique products in the cart
export const getCartProductIDs = async (userId: number): Promise<number[]> => {
    try {
        const redisCart = await redisCartModel.getUserCart(userId);
        if (redisCart === null) throw new Error('No cart products in Redis');
        return redisCart.map((cartProduct) => cartProduct.productId);
    } catch (e) {
        console.error(e);
        return postgresCartModel.getCartProductIDs(userId);
    }
};
