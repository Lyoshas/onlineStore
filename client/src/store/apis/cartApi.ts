import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';
import CartProduct from '../../interfaces/CartProduct';

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
            invalidatesTags: ['CartItemCount', 'GetCart'],
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
    }),
});

export const {
    useCountCartItemsQuery,
    useUpsertCartProductMutation,
    useGetCartQuery,
    useDeleteCartProductMutation,
} = cartApi;
