import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';

export const orderCheckApi = createApi({
    reducerPath: '',
    baseQuery: createBaseQuery({
        baseUrl: 'http://localhost/api/user/order',
        includeAccessToken: false,
    }),
    tagTypes: ['CheckOrderFeasibility'],
    endpoints: (builder) => ({
        // we should use 'query' instead of 'mutation' because we are fetching
        // and caching data from the server
        checkOrderFeasibility: builder.query<
            { [productId: number]: { canBeOrdered: boolean } },
            { productId: number; quantity: number }[]
        >({
            query: (body) => {
                return {
                    url: '/check-feasibility',
                    method: 'POST',
                    body
                };
            },
            providesTags: ['CheckOrderFeasibility'],
        }),
    }),
});

export const { useLazyCheckOrderFeasibilityQuery } = orderCheckApi;
