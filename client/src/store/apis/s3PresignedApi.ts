import { createApi } from '@reduxjs/toolkit/query/react';

import createBaseQuery from '../util/createBaseQuery';

export const s3PresignedUrlApi = createApi({
    reducerPath: 's3PresignedUrlApi',
    baseQuery: createBaseQuery({
        baseUrl: 'http://localhost/api/s3',
        includeAccessToken: true,
    }),
    endpoints: (builder) => ({
        getPresignedUrlForUpload: builder.query<
            { presignedUrl: string },
            {
                fileName: string;
                mimeType: string;
                contentLength: number;
            }
        >({
            query: (args) => {
                const queryParams = {
                    fileName: args.fileName,
                    mimeType: args.mimeType,
                    contentLength: String(args.contentLength),
                };

                return {
                    url: `/presigned-url?${new URLSearchParams(
                        queryParams
                    ).toString()}`,
                    method: 'GET',
                    credentials: 'include',
                };
            },
        }),
    }),
});

export const { useLazyGetPresignedUrlForUploadQuery } = s3PresignedUrlApi;
