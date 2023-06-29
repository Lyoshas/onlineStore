import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const s3UploadApi = createApi({
    reducerPath: 's3UploadApi',
    // we don't use "createBaseQuery" here, because it would override the 'Content-Type' to 'application/json'
    baseQuery: fetchBaseQuery({ baseUrl: '' }),
    endpoints: (builder) => ({
        uploadImageToS3: builder.mutation<
            void,
            { presignedUrl: string; imageData: File }
        >({
            query: (args) => {
                return {
                    url: args.presignedUrl,
                    method: 'PUT',
                    body: args.imageData,
                    headers: { 'Content-Type': args.imageData.type },
                };
            },
        }),
    }),
});

export const { useUploadImageToS3Mutation } = s3UploadApi;
