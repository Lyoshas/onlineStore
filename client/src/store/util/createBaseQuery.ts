import { fetchBaseQuery } from '@reduxjs/toolkit/dist/query';

import isAccessTokenRunningOut from '../../util/IsAccessTokenRunningOut';
import store, { RootState } from '..';
import getAccessToken from './getAccessToken';
import { authActions } from '../slices/auth';

interface CreateBaseQueryArgs {
    baseUrl: string;
    includeAccessToken: boolean;
}

const createBaseQuery = (options: CreateBaseQueryArgs) => {
    const { baseUrl, includeAccessToken } = options;

    return fetchBaseQuery({
        baseUrl: baseUrl,
        credentials: 'include',
        prepareHeaders: async (headers, { getState }) => {
            headers.set('Content-Type', 'application/json');

            if (includeAccessToken) {
                // getting the access token from the Redux store
                let accessToken = (getState() as RootState).auth.accessToken;

                if (accessToken) {
                    if (isAccessTokenRunningOut(accessToken)) {
                        // making a request to the API to get a new access token
                        try {
                            accessToken = await getAccessToken();
                            // updating the token in the Redux store
                            store.dispatch(
                                authActions.updateAccessToken(accessToken)
                            );
                        } catch (e) {
                            // if we make it here, the API server is either down or the refresh token has expired
                            store.dispatch(authActions.invalidateUser());
                            return headers;
                        }
                    }

                    headers.set('Authorization', `Bearer ${accessToken}`);
                }
            }

            return headers;
        },
    });
};

export default createBaseQuery;
