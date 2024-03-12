import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';
import { cartApi } from './cartApi';

// this is what the order creation endpoint returns if the payment method is 'Pay now'
export interface OrderCreationResultPayNow {
    data: string;
    signature: string;
}

// this is what the order creation endpoint returns if the payment method is 'Pay upon delivery'
export interface OrderCreationResultPayUponDelivery {
    orderId: number;
}

// this is what the order creation endpoint accepts if a user is authenticated
export interface OrderCreationInputAuth {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    paymentMethod: string;
    city: string;
    deliveryWarehouse: string;
}

// this is what the order creation endpoint accepts if a user is anonymous
export interface OrderCreationInputNoAuth extends OrderCreationInputAuth {
    email: string;
    orderProducts: { productId: number; quantity: number }[];
}

// the 'createOrder' endpoint invalidates 2 endpoints from 'cartApi'
// RTK Query doesn't allow to invalidate tags from other APIs
// the only way is to "inject" the createOrder endpoint into cartApi
const extendedCartApi = cartApi.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<
            OrderCreationResultPayNow | OrderCreationResultPayUponDelivery,
            OrderCreationInputAuth | OrderCreationInputNoAuth
        >({
            query: (args) => ({
                url: '/order',
                method: 'POST',
                body: args,
            }),
            invalidatesTags: ['CartItemCount', 'GetCart'],
        }),
    }),
    overrideExisting: false,
});

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: createBaseQuery({
        baseUrl: 'http://localhost/api/user/order',
        includeAccessToken: true,
    }),
    tagTypes: ['CartItemCount', 'GetCart'],
    endpoints: (builder) => ({
        getOrderRecipients: builder.query<
            {
                orderRecipients: {
                    firstName: string;
                    lastName: string;
                    phoneNumber: string;
                }[];
            },
            void
        >({
            query: () => ({
                url: '/recipients',
                method: 'GET',
            }),
        }),
    }),
});

export const { useCreateOrderMutation } = extendedCartApi;

export const { useLazyGetOrderRecipientsQuery } = orderApi;
