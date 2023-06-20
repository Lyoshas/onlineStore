import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import jwt_decode from 'jwt-decode';

import store from '../store';
import { authActions } from '../store/slices/auth';
import AccessTokenPayload from '../interfaces/AccessTokenPayload';

const httpLink = createHttpLink({
    uri: '/api/graphql',
});

const getAccessToken = async () => {
    const res = await fetch('/api/auth/refresh', {
        method: 'GET',
        credentials: 'include',
    });
    const data: { accessToken: string } = await res.json();

    return data.accessToken;
};

const authLink = setContext(async (_: unknown, { headers }) => {
    // get the access token from the Redux store
    // it's not possible to use the "useSelector" hook in non-component functions
    let accessToken = store.getState().auth.accessToken;
    const decoded: AccessTokenPayload | null = accessToken
        ? jwt_decode(accessToken)
        : null;

    // if the token expires in 5 seconds or has already expired
    if (decoded && decoded.exp - Date.now() / 1000 < 5) {
        // the token is about to expire, so we need to make a request to renew this token
        accessToken = await getAccessToken();
        store.dispatch(authActions.updateAccessToken(accessToken));
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
