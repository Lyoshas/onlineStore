import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import store from '../store';
import { authActions } from '../store/slices/auth';
import getAccessToken from '../store/util/getAccessToken';
import isAccessTokenRunningOut from '../util/IsAccessTokenRunningOut';

const httpLink = createHttpLink({
    uri: '/api/graphql',
});

const authLink = setContext(async (_: unknown, { headers }) => {
    // get the access token from the Redux store
    // it's not possible to use the "useSelector" hook in non-component functions
    let accessToken = store.getState().auth.accessToken;

    // if the token expires in 5 seconds or has already expired
    if (accessToken && isAccessTokenRunningOut(accessToken)) {
        // the token is about to expire, so we need to make a request to renew this token
        try {
            accessToken = await getAccessToken();
            store.dispatch(authActions.updateAccessToken(accessToken));
        } catch (e) {
            // if we make it here, the API server is either down or the refresh token has expired
            accessToken = null;
            store.dispatch(authActions.invalidateUser());
        }
    }

    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export default client;
