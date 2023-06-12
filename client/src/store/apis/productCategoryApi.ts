import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productCategoryApi = createApi({
    reducerPath: 'productCategoryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost/api/product',
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
