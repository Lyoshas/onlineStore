import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';

export const shippingApi = createApi({
    reducerPath: 'shippingApi',
    baseQuery: createBaseQuery({
        baseUrl: 'http://localhost/api/shipping',
        includeAccessToken: false,
    }),
    endpoints: (builder) => ({
        getSupportedCities: builder.query<{ supportedCities: string[] }, void>({
            query: () => ({
                url: '/supported-cities',
                method: 'GET',
            }),
        }),
        getNovaPoshtaWarehouses: builder.query<
            { warehouses: string[] },
            { city: string }
        >({
            query: (args) => ({
                url: `/nova-poshta/warehouses?${new URLSearchParams({
                    city: args.city,
                }).toString()}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetSupportedCitiesQuery,
    useLazyGetNovaPoshtaWarehousesQuery,
} = shippingApi;
