import CartEntry from '../interfaces/CartEntry.js';
import CartProductSummary from '../interfaces/CartProductSummary.js';
import redis from '../services/redis.service.js';
import camelCaseObject from '../util/camelCaseObject.js';
import * as productModel from './product.js';

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
    userId: number,
    includeDuplicates: boolean
): Promise<number | null> => {
    const cart = await getUserCart(userId);

    if (cart === null) return null;

    if (!includeDuplicates) return cart.length;
    return cart.reduce((acc, cartItem) => acc + cartItem.quantity, 0);
};

export const upsertProductToCart = async (
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
                await productModel.getProduct(productId, [
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

// inserts lots of products into the cart of the provided user
// this function assumes that it needs to perform an insert, NOT an update
export const bulkInsert = async (
    userId: number,
    cartProductsSummary: CartProductSummary[]
) => {
    let cart = await getUserCart(userId);

    // if the cart isn't cached, do nothing
    if (cart === null) return;

    // we need to fetch 'title', 'price' and 'initialImageUrl' for the provided products
    const productIDs: number[] = cartProductsSummary.map(
        (cartProduct) => cartProduct.productId
    );
    const missingProductData = await productModel.getMissingCartProductInfo(
        productIDs
    );

    cartProductsSummary.forEach((cartProduct) => {
        cart!.push({
            productId: cartProduct.productId,
            quantity: cartProduct.quantityInCart,
            ...missingProductData[cartProduct.productId]!,
        });
    });

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

    // if there's nothing to delete, just return
    if (delKeys.length === 0) return;

    return redis.del(...delKeys);
}

export const isProductInTheCart = async (
    userId: number,
    productId: number
): Promise<boolean> => {
    const cart = await getUserCart(userId);

    if (cart) {
        for (let cartEntry of cart) {
            if (cartEntry.productId === productId) return true;
        }
    }

    return false;
};
