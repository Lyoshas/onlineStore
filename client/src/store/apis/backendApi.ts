import { createApi } from '@reduxjs/toolkit/query/react';
import createBaseQuery from '../util/createBaseQuery';

export const backendApi = createApi({
    reducerPath: 'backendApi',
    tagTypes: [
        'CartItemCount',
        'GetCart',
        'DisplayOrderList',
        'CheckOrderFeasibility',
    ],
    baseQuery: createBaseQuery({
        baseUrl: '/api',
        includeAccessToken: true,
    }),
    endpoints: () => ({}),
});
