import { backendApi } from './backendApi';

export const shippingApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getSupportedCities: builder.query<{ supportedCities: string[] }, void>({
            query: () => ({
                url: '/shipping/supported-cities',
                method: 'GET',
            }),
        }),
        getNovaPoshtaWarehouses: builder.query<
            { warehouses: string[] },
            { city: string }
        >({
            query: (args) => ({
                url: `/shipping/nova-poshta/warehouses?${new URLSearchParams({
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
