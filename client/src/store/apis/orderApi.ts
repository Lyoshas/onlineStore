import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';

export const orderApi = createApi({
    reducerPath: 'orderApi',
    baseQuery: createBaseQuery({
        baseUrl: 'http://localhost/api/user/order',
        includeAccessToken: true,
    }),
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

export const { useLazyGetOrderRecipientsQuery } = orderApi;
