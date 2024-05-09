import { backendApi } from './backendApi';

export const fundraisingApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        getFundraisingCampaigns: builder.query<
            {
                fundraisingCampaigns: {
                    id: number;
                    title: string;
                    financialObjective: number;
                    previewUrl: string;
                    raisedMoney: number;
                    fundingProgressPercentage: number;
                }[];
            },
            { status: 'ongoing' | 'finished' }
        >({
            query: (args) => ({
                url: `/fundraising-campaigns?status=${args.status}`,
                method: 'GET',
            }),
        }),
        createPendingTransaction: builder.mutation<
            { data: string; signature: string },
            { campaignId: number; donationAmount: number }
        >({
            query: (args) => ({
                url: `/fundraising-campaigns/pending-transactions`,
                method: 'POST',
                body: args,
            }),
        }),
    }),
});

export const {
    useLazyGetFundraisingCampaignsQuery,
    useCreatePendingTransactionMutation,
} = fundraisingApi;
