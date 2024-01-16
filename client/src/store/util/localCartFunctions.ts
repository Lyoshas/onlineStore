import { RootState } from '..';

// USER_CART_LOCAL_STORAGE_KEY holds the name of the key in localStorage that stores cart data
const USER_CART_LOCAL_STORAGE_KEY = 'userCart';

type CartData = RootState['localCart']['products'];

export const loadLocalCartData = (): CartData => {
    let stringifiedCartProducts = localStorage.getItem(
        USER_CART_LOCAL_STORAGE_KEY
    );

    try {
        const cartProducts =
            stringifiedCartProducts === null
                ? {}
                : JSON.parse(stringifiedCartProducts);
        return cartProducts;
    } catch {
        // if an error occurs during JSON.parse, return an empty object designating an empty cart
        return {};
    }
};

export const persistCartToLocalStorage = (cartData: CartData) => {
    localStorage.setItem(USER_CART_LOCAL_STORAGE_KEY, JSON.stringify(cartData));
};
