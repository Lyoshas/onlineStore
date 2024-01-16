import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';
import CartProduct from '../../interfaces/CartProduct';
import { localCartActions } from '../slices/localCart';

export const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery: createBaseQuery({
        baseUrl: 'http://localhost/api/user',
        includeAccessToken: true,
    }),
    tagTypes: ['CartItemCount', 'GetCart'],
    endpoints: (builder) => ({
        countCartItems: builder.query<{ cartItemCount: number }, void>({
            query: () => {
                return {
                    url: '/cart/count',
                    method: 'GET',
                };
            },
            providesTags: ['CartItemCount'],
        }),
        // this function adds a new item to the cart with the specified quantity
        // if the product is already in the cart, the quantity is replaced
        upsertCartProduct: builder.mutation<
            void,
            { productId: number; quantity: number }
        >({
            query: (productData) => {
                return {
                    url: '/cart',
                    method: 'PUT',
                    body: productData,
                };
            },
            // refetch countCartItems whenever this endpoint is executed
            invalidatesTags: (result, error, arg) => {
                // if an error occurred, don't invalidate anything
                if (error) return [];
                return ['CartItemCount', 'GetCart'];
            },
        }),
        getCart: builder.query<
            { products: CartProduct[]; totalPrice: number },
            void
        >({
            query: () => {
                return {
                    url: '/cart',
                    method: 'GET',
                };
            },
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                // each time we fetch the cart from the API,
                // update the local cart stored in Redux (and localStorage)
                try {
                    // waiting for the query to finish
                    const cartProducts = (await queryFulfilled).data.products;
                    dispatch(localCartActions.replaceCart(cartProducts));
                } catch (e) {
                    // if something goes wrong with fetching the cart, don't do anything
                }
            },
            providesTags: ['GetCart'],
        }),
        deleteCartProduct: builder.mutation<void, { productId: number }>({
            query: ({ productId }) => {
                return {
                    url: `/cart/${productId}`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['CartItemCount', 'GetCart'],
        }),
        checkIfSafeToAddProductToCart: builder.query<
            | { safeToAdd: true; reason: null }
            | { safeToAdd: false; reason: 'InsufficientProductStock' }
            | {
                  safeToAdd: false;
                  reason: 'ExceededMaxOrderQuantity';
                  maxOrderQuantity: number;
              },
            { productId: number; quantityToAdd: number }
        >({
            query: ({ productId, quantityToAdd }) => {
                return {
                    url: `/cart/is-safe-to-add-product?${new URLSearchParams({
                        productId: String(productId),
                        quantityToAdd: String(quantityToAdd),
                    }).toString()}`,
                    method: 'GET',
                };
            },
        }),
        synchronizeLocalCartWIthApi: builder.mutation<
            void,
            { productId: number; quantity: number }[]
        >({
            query: (cartItems) => {
                return {
                    url: '/cart/synchronize',
                    method: 'PUT',
                    body: cartItems,
                };
            },
            invalidatesTags: ['GetCart', 'CartItemCount'],
        }),
        getMaximumProductsInCart: builder.query<
            { maxProductsInCart: number },
            { productId: number }
        >({
            // any component that uses this endpoint msut provide a unique product id
            // this is done to prevent a bug where multiple components get the same state (same requestId)
            query: ({ productId }) => {
                return {
                    url: '/cart/maximum-items',
                    method: 'GET',
                };
            },
        }),
    }),
});

export const {
    useLazyCountCartItemsQuery,
    useUpsertCartProductMutation,
    useLazyGetCartQuery,
    useDeleteCartProductMutation,
    useLazyCheckIfSafeToAddProductToCartQuery,
    useSynchronizeLocalCartWIthApiMutation,
    useLazyGetMaximumProductsInCartQuery,
} = cartApi;
