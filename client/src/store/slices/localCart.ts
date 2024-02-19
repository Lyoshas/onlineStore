import {
    PayloadAction,
    createListenerMiddleware,
    createSlice,
} from '@reduxjs/toolkit';

import CartProduct from '../../interfaces/CartProduct';
import { RootState } from '..';
import {
    loadLocalCartData,
    persistCartToLocalStorage,
} from '../util/localCartFunctions';

interface CartState {
    products: {
        [productId: string]: CartProduct | undefined;
    };
}

const initialState: CartState = {
    products: loadLocalCartData(),
};

// this slice will be used to allow anonymous users to interact with the cart locally
// this will NOT be used for authenticated users
const localCartSlice = createSlice({
    name: 'localCart',
    initialState,
    reducers: {
        upsertCartProduct(state, action: PayloadAction<CartProduct>) {
            const newProduct = action.payload;

            // if this product is already in the local cart, modify its quantity
            if (newProduct.productId in state.products) {
                state.products[newProduct.productId]!.quantity =
                    newProduct.quantity;
            } else {
                // if this product is NOT in the local cart, simply push it there
                state.products[newProduct.productId] = { ...newProduct };
            }
        },
        deleteCartProduct(state, action: PayloadAction<{ productId: number }>) {
            const productId = action.payload.productId;
            delete state.products[productId];
        },
        updateCartProductQuantity(
            state,
            action: PayloadAction<{ productId: number; newQuantity: number }>
        ) {
            const { productId, newQuantity } = action.payload;

            const storedProduct = state.products[productId];
            if (!storedProduct) return;
            storedProduct.quantity = newQuantity;
        },
        replaceCart(state, action: PayloadAction<CartProduct[]>) {
            const cartProducts = action.payload;
            state.products = cartProducts.reduce((acc, cartProduct) => {
                return {
                    ...acc,
                    [cartProduct.productId]: { ...cartProduct },
                };
            }, {});
        },
        emptyCart(state) {
            state.products = {};
        },
        updateCartProductsAvailability(
            state,
            action: PayloadAction<{
                [productId: number]: { canBeOrdered: boolean };
            }>
        ) {
            for (let [productId, productData] of Object.entries(
                action.payload
            )) {
                if (productId in state.products) {
                    state.products[productId]!.canBeOrdered =
                        productData.canBeOrdered;
                }
            }
        },
    },
});

export const localCartActions = localCartSlice.actions;

// this listener will listen for Redux store changes and persist local cart data to localStorage
const cartListenerMiddleware = createListenerMiddleware();
cartListenerMiddleware.startListening({
    predicate: (action, currentState, previousState) => {
        // if the action is related to the local cart, execute the effect below
        return action.type.startsWith(localCartSlice.name);
    },
    effect: async (action, { getState }) => {
        const cartProducts = (getState() as RootState).localCart.products;
        // persisting the local cart to local storage on every Redux store change
        persistCartToLocalStorage(cartProducts);
    },
});

export const persistLocalCartMiddleware = cartListenerMiddleware.middleware;

export default localCartSlice;
