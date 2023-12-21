import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';
import ProductCategory from '../../interfaces/ProductCategory';

export const productCategoryApi = createApi({
    reducerPath: 'productCategoryApi',
    baseQuery: createBaseQuery({
        baseUrl: 'http://localhost/api/product',
        includeAccessToken: false,
    }),
    endpoints: (builder) => ({
        productCategories: builder.query<
            { categories: ProductCategory[] },
            void
        >({
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
