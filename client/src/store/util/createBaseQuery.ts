import { fetchBaseQuery } from '@reduxjs/toolkit/dist/query';
import { RootState } from '..';

interface CreateBaseQueryArgs {
    baseUrl: string;
    includeAccessToken: boolean;
}

const createBaseQuery = (options: CreateBaseQueryArgs) => {
    const { baseUrl, includeAccessToken } = options;

    return fetchBaseQuery({
        baseUrl: baseUrl,
        prepareHeaders: (headers, { getState }) => {
            if (includeAccessToken) {
                const accessToken = (getState() as RootState).auth.accessToken;

                if (accessToken) {
                    headers.set('Authorization', `Bearer ${accessToken}`);
                }
            }

            headers.set('Content-Type', 'application/json');

            return headers;
        },
    });
};

export default createBaseQuery;
