import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';

export const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery: createBaseQuery({
        baseUrl: 'http://localhost/api/user',
        includeAccessToken: true,
    }),
    endpoints: (builder) => ({
        countCartItems: builder.query<{ cartItemCount: number }, void>({
            query: () => {
                return {
                    url: '/cart/count',
                    method: 'GET',
                };
            },
        }),
    }),
});

export const { useCountCartItemsQuery } = cartApi;
