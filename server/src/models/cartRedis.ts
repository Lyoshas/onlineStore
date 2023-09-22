import CartEntry from '../interfaces/CartEntry.js';
import redis from '../services/redis.service.js';
import camelCaseObject from '../util/camelCaseObject.js';
import { getProduct } from './product.js';

// user carts are stored in Redis using this format:
// cart.userId.ID where ID is the user id
// for example, the cart for userId = 5 is stored under the 'cart.userId.5' key
export const getRedisCartKey = (userId: number) => `cart.userId.${userId}`;

// null will be returned if the cart is not cached
export const getUserCart = async (
    userId: number
): Promise<CartEntry[] | null> => {
    const cart = await redis.get(getRedisCartKey(userId));

    if (cart === null) return null;

    try {
        return JSON.parse(cart) as CartEntry[];
    } catch (e) {
        // if the parsing fails, return null
        return null;
    }
};

// put the cart into Redis
// it will expire after some time (specified in process.env.REDIS_CART_EXPIRATION in seconds)
export const cacheUserCart = async (
    userId: number,
    cart: CartEntry[]
): Promise<void> => {
    const key = getRedisCartKey(userId);
    await redis.set(key, JSON.stringify(cart));
    await redis.expire(key, +process.env.REDIS_CART_EXPIRATION!);
};

// null means the cart isn't cached
export const countCartItems = async (
    userId: number
): Promise<number | null> => {
    const cart = await getUserCart(userId);

    if (cart === null) return null;

    return cart.reduce((acc, cartItem) => acc + cartItem.quantity, 0);
};

export const addProductToCart = async (
    userId: number,
    productId: number,
    quantity: number
): Promise<void> => {
    let cart = await getUserCart(userId);

    // if the cart isn't cached, do nothing
    if (cart === null) return;

    let entryExists = false;

    for (let cartItem of cart) {
        if (cartItem.productId === productId) {
            cartItem.quantity = quantity;
            entryExists = true;
        }
    }

    if (!entryExists) {
        cart.push({
            productId,
            ...camelCaseObject(
                await getProduct(productId, [
                    'title',
                    'price',
                    'initial_image_url',
                ])
            ),
            quantity,
        });
    }

    await cacheUserCart(userId, cart);
};

export const deleteProductFromCart = async (
    userId: number,
    productId: number
) => {
    const cart = await getUserCart(userId);

    // if the cart isn't cached, do nothing
    if (cart === null) return;

    await cacheUserCart(
        userId,
        cart.filter((product) => product.productId !== productId)
    );
};

export function cleanCart(userId: number): Promise<number>;
export function cleanCart(userIds: number[]): Promise<number>;

export function cleanCart(userId: unknown): unknown {
    const delKeys: string[] = [];

    if (typeof userId === 'number') {
        delKeys.push(getRedisCartKey(userId));
    } else if (Array.isArray(userId)) {
        delKeys.push(...userId.map((userId) => getRedisCartKey(userId)));
    } else {
        throw new Error('Unknown userId type: must be "number" or "number[]"');
    }

    return redis.del(...delKeys);
}
