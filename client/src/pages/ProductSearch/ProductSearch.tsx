import { Fragment, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames';

import ProductList from '../../components/ProductList/ProductList';
import ErrorMessageBlock from '../../components/UI/ErrorMessageBlock/ErrorMessageBlock';
import Layout from '../../components/Layout/Layout';
import Pagination from '../ProductListPage/Pagination/Pagination';
import SearchBlock from '../../components/SearchBlock/SearchBlock';
import { useSearchQuery } from './hooks/useSearchQuery';
import classes from './ProductSearch.module.css';

const ProductSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const pageParameter = searchParams.get('page');
    const numericPage = Number(pageParameter);
    // the 'page' parameter is allowed to be omitted
    const isPageValid =
        // the page parameter must be a number and must be in this range: 1 < page <= 2147483647
        !Number.isNaN(numericPage) &&
        numericPage > 0 &&
        numericPage <= 0x7fffffff;
    const currentPage = isPageValid ? numericPage : 1;

    const searchQuery = searchParams.get('searchQuery') || '';
    const {
        sendSearchApiRequest,
        isSearching,
        isSearchError,
        fetchedData,
        isSearchCalled,
    } = useSearchQuery();

    useEffect(() => {
        if (
            !isPageValid ||
            (fetchedData && numericPage > fetchedData.totalPages)
        ) {
            setSearchParams((prevSearchParams) => {
                prevSearchParams.set('page', '1');
                return prevSearchParams;
            });
        }
    }, [isPageValid, fetchedData, numericPage, setSearchParams]);

    useEffect(() => {
        if (searchQuery === '') return;
        sendSearchApiRequest(currentPage, searchQuery);
    }, [searchQuery, sendSearchApiRequest, currentPage]);

    const productList = (fetchedData?.productList || null) as
        | Exclude<typeof fetchedData, null>['productList']
        | null;
    const totalPages = fetchedData?.totalPages || null;

    const searchQueryValidationHandler = useCallback(
        (searchQuery: string) => searchQuery.length <= 1000,
        []
    );

    if (isSearchError) {
        return (
            <ErrorMessageBlock
                message={
                    'Something went wrong while searching for products. Please try reloading the page.'
                }
            />
        );
    }

    return (
        <Fragment>
            <SearchBlock
                debounceMs={500}
                validationFn={searchQueryValidationHandler}
                errorMessageOnValidationFail="The search query must not exceed 1000 characters"
                isLoading={isSearching}
                mainContent={
                    <Fragment>
                        <Layout
                            className={classNames(
                                !isSearching
                                    ? classes['product-search-layout']
                                    : null
                            )}
                        >
                            {!isSearchCalled && (
                                <p className={classes['product-search__hint']}>
                                    Please enter a search query
                                </p>
                            )}
                            {!isSearching && productList?.length === 0 && (
                                <p className={classes['product-search__hint']}>
                                    Nothing was found. Please try another query
                                </p>
                            )}
                            {productList !== null &&
                                totalPages !== null &&
                                productList.length > 0 && (
                                    <Fragment>
                                        <ProductList products={productList} />
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                        />
                                    </Fragment>
                                )}
                        </Layout>
                    </Fragment>
                }
            />
        </Fragment>
    );
};

export default ProductSearch;
