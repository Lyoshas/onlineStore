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
    }),
});

export const { useLazyGetFundraisingCampaignsQuery } = fundraisingApi;
