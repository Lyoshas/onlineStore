import { backendApi } from './backendApi';

export const s3PresignedUrlApi = backendApi.injectEndpoints({
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
                    url: `/s3/presigned-url?${new URLSearchParams(
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
