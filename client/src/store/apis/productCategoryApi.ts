import ProductCategory from '../../interfaces/ProductCategory';
import { backendApi } from './backendApi';

export const productCategoryApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        productCategories: builder.query<
            { categories: ProductCategory[] },
            void
        >({
            query: (data) => {
                return {
                    url: '/product/categories',
                    method: 'GET',
                };
            },
        }),
    }),
});

export const { useProductCategoriesQuery } = productCategoryApi;
