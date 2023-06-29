import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';

export const productCategoryApi = createApi({
    reducerPath: 'productCategoryApi',
    baseQuery: createBaseQuery({
        baseUrl: 'http://localhost/api/product',
        includeAccessToken: false,
    }),
    endpoints: (builder) => ({
        productCategories: builder.query<{ categories: string[] }, void>({
            query: (data) => {
                return {
                    url: '/categories',
                    method: 'GET',
                };
            },
        }),
    }),
});

export const { useProductCategoriesQuery } = productCategoryApi;
