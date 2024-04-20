import { backendApi } from './backendApi';

export const warrantyRequestApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getWarrantyRequestList: builder.query<
            {
                warrantyRequests: {
                    id: number;
                    issueDescription: string;
                    serviceCenter: string;
                    userDataRequestInitiator: {
                        firstName: string;
                        lastName: string;
                        email: string;
                    };
                    repairingProductData: {
                        title: string;
                        previewURL: string;
                    };
                    statusHistory: [
                        {
                            statusChangeTime: string;
                            status: string;
                        },
                        {
                            statusChangeTime: string;
                            status: string;
                        },
                        {
                            statusChangeTime: string;
                            status: string;
                        }
                    ];
                }[];
            },
            void
        >({
            query: () => ({
                url: '/user/warranty-requests',
                method: 'GET',
            }),
        }),
    }),
});

export const { useGetWarrantyRequestListQuery } = warrantyRequestApi;
