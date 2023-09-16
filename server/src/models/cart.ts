import { PoolClient } from 'pg';

import CartEntry from '../interfaces/CartEntry.js';
import * as postgresCartModel from './cartPostgres.js';
import * as redisCartModel from './cartRedis.js';

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

// this function will first try to count cart items that are stored in Redis
// if it fails, the function will fall back to using PostgreSQL
export const countCartItems = async (userId: number): Promise<number> => {
    try {
        const cartItemsCountRedis = await redisCartModel.countCartItems(userId);

        if (cartItemsCountRedis !== null) return cartItemsCountRedis;
    } catch (error) {
        console.error('Error counting cart items in Redis:', error);
    }

    return postgresCartModel.countCartItems(userId);
};

export const addProductToCart = async (
    userId: number,
    productId: number,
    quantity: number
): Promise<void> => {
    await postgresCartModel.addProductToCart(userId, productId, quantity);

    try {
        // if the cart cache is empty, this function won't do anything
        // because fetching the cart from Postgres and then adding a product to it would take too long
        await redisCartModel.addProductToCart(userId, productId, quantity);
    } catch (error) {
        console.error('Error adding a product to the cart in Redis', error);
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
