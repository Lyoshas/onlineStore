import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import store from '../store';

const httpLink = createHttpLink({
    uri: '/api/graphql',
});

const authLink = setContext((_: unknown, { headers }) => {
    // get the access token from the Redux store
    // it's not possible to use the "useSelector" hook in non-component functions
    const token = store.getState().auth.accessToken;
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export default client;
