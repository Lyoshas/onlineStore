import { useSelector } from 'react-redux';
import { useLazyQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';

import {
    GET_PRODUCTS_BY_SEARCH_QUERY_NO_AUTH,
    GET_PRODUCTS_BY_SEARCH_QUERY_WITH_AUTH,
} from '../../../graphql/queries/getProductsBySearchQuery';
import { RootState } from '../../../store';
import {
    SearchProductsNoAuthQuery,
    SearchProductsWithAuthQuery,
} from '../../../__generated__/graphql';

export const useSearchQuery = () => {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const cartProducts = useSelector(
        (state: RootState) => state.localCart.products
    );
    const [
        searchProductsWithAuth,
        {
            loading: isSearchingWithAuth,
            error: searchErrorWithAuth,
            data: searchDataWithAuth,
            called: searchCalledWithAuth,
        },
    ] = useLazyQuery(GET_PRODUCTS_BY_SEARCH_QUERY_WITH_AUTH);
    const [
        searchProductsNoAuth,
        {
            loading: isSearchingNoAuth,
            error: searchErrorNoAuth,
            data: searchDataNoAuth,
            called: searchCalledNoAuth,
        },
    ] = useLazyQuery(GET_PRODUCTS_BY_SEARCH_QUERY_NO_AUTH);

    const sendSearchApiRequest = useCallback(
        (page: number, searchQuery: string) => {
            if (isAuthenticated === null) return;

            const apolloOptions = { variables: { page, searchQuery } };
            isAuthenticated
                ? searchProductsWithAuth(apolloOptions)
                : searchProductsNoAuth(apolloOptions);
        },
        [isAuthenticated, searchProductsWithAuth, searchProductsNoAuth]
    );

    const isSearching: boolean = isSearchingNoAuth || isSearchingWithAuth;
    const isSearchCalled: boolean = searchCalledNoAuth || searchCalledWithAuth;
    const isSearchError: boolean = !!searchErrorNoAuth || !!searchErrorWithAuth;

    // if we don't use useMemo, infinite useEffect loop will be caused down the line
    // because "fetchedDataCached" will always be recreated
    const fetchedDataCached = useMemo(() => {
        const fetchedData = (searchDataWithAuth || searchDataNoAuth || null) as
            | SearchProductsNoAuthQuery
            | SearchProductsWithAuthQuery
            | null;
        const productList:
            | SearchProductsNoAuthQuery['searchProducts']['productList']
            | SearchProductsWithAuthQuery['searchProducts']['productList']
            | null = fetchedData
            ? fetchedData.searchProducts.productList.length > 0 &&
              'isInTheCart' in fetchedData.searchProducts.productList[0]
                ? (fetchedData as SearchProductsWithAuthQuery).searchProducts
                      .productList
                : (
                      fetchedData as SearchProductsNoAuthQuery
                  ).searchProducts.productList.map((product) => ({
                      ...product,
                      isInTheCart: product.id in cartProducts,
                  }))
            : null;

        return fetchedData !== null
            ? {
                  productList: productList,
                  totalPages: fetchedData.searchProducts.totalPages,
              }
            : null;
    }, [searchDataWithAuth, searchDataNoAuth, cartProducts]);

    return {
        sendSearchApiRequest,
        isSearching,
        isSearchError,
        fetchedData: fetchedDataCached,
        isSearchCalled,
    };
};
