import apolloClient from '../../graphql/client';

// this function deletes the getProductsByPage GraphQL query cache
// for example, if you called "products($page: 2)", the response from the server will be cached, and this function will remove this cache
// this function is useful if you want to invalidate stale cache
export const deleteProductsByPageCache = () => {
    apolloClient.cache.modify({
        fields: {
            products(_, { DELETE }) {
                return DELETE;
            },
        },
    });
};
