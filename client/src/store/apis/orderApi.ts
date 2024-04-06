import { backendApi } from './backendApi';

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
export const orderApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation<
            OrderCreationResultPayNow | OrderCreationResultPayUponDelivery,
            OrderCreationInputAuth | OrderCreationInputNoAuth
        >({
            query: (args) => ({
                url: '/user/order',
                method: 'POST',
                body: args,
            }),
            invalidatesTags: ['CartItemCount', 'GetCart', 'DisplayOrderList'],
        }),
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
                url: '/user/order/recipients',
                method: 'GET',
            }),
        }),
        getOrderList: builder.query<
            {
                orders: [
                    {
                        orderId: number;
                        previewURL: string;
                        paymentMethod: string;
                        totalPrice: number;
                        isPaid: boolean;
                        deliveryPostalService: {
                            name: string;
                            warehouseDescription: string;
                        };
                        recipient: {
                            firstName: string;
                            lastName: string;
                            phoneNumber: string;
                        };
                        creationTime: string;
                        statusChangeHistory: {
                            orderStatus: string;
                            statusChangeTime: string;
                        }[];
                    }
                ];
            },
            void
        >({
            query: () => ({
                url: '/user/orders',
            }),
            providesTags: ['DisplayOrderList'],
        }),
        checkOrderFeasibility: builder.query<
            { [productId: number]: { canBeOrdered: boolean } },
            { productId: number; quantity: number }[]
        >({
            query: (body) => {
                return {
                    url: '/user/order/check-feasibility',
                    method: 'POST',
                    body,
                };
            },
            providesTags: ['CheckOrderFeasibility'],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetOrderListQuery,
    useLazyGetOrderRecipientsQuery,
    useLazyCheckOrderFeasibilityQuery,
} = orderApi;
