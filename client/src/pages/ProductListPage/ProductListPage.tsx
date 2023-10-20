import { useLazyQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ProductList from '../../components/ProductList/ProductList';
import {
    GET_PRODUCTS_BY_PAGE_NO_AUTH,
    GET_PRODUCTS_BY_PAGE_WITH_AUTH,
} from '../../graphql/queries/getProductsByPage';
import Loading from '../../components/UI/Loading/Loading';
import ErrorMessageBlock from '../../components/UI/ErrorMessageBlock/ErrorMessageBlock';
import Layout from '../../components/Layout/Layout';
import classes from './ProductListPage.module.css';
import Pagination from './Pagination/Pagination';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const ProductListPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    // if "page" is not specified in the query string, set to default value of 1
    const currentPage: number = Number(searchParams.get('page')) || 1;

    useEffect(() => {
        if (currentPage <= 0) navigate('?page=1');
    }, [currentPage, navigate]);

    const [
        getProductsByPageNoAuth,
        {
            loading: productsNoAuthLoading,
            error: productsNoAuthError,
            data: productsNoAuthData,
        },
    ] = useLazyQuery(GET_PRODUCTS_BY_PAGE_NO_AUTH, {
        variables: { page: currentPage },
    });
    const [
        getProductsByPageWithAuth,
        {
            loading: productsWithAuthLoading,
            error: productsWithAuthError,
            data: productsWithAuthData,
        },
    ] = useLazyQuery(GET_PRODUCTS_BY_PAGE_WITH_AUTH, {
        variables: { page: currentPage },
    });

    useEffect(() => {
        if (isAuthenticated === null) return;
        isAuthenticated
            ? getProductsByPageWithAuth()
            : getProductsByPageNoAuth();
    }, [isAuthenticated]);

    const productsLoading = productsNoAuthLoading || productsWithAuthLoading;
    const products =
        productsNoAuthData?.products || productsWithAuthData?.products || null;
    const productsFetchError = productsNoAuthError || productsWithAuthError;

    useEffect(() => {
        if (products?.productList.length !== 0) return;

        // if there are no products, it means the user has gone too far,
        // so we need to redirect to the first page
        navigate(`?page=1`);
    }, [products, navigate]);

    if (productsLoading || !products || products.productList.length === 0) {
        return (
            <div className="flex-wrapper">
                <Loading />
            </div>
        );
    }

    if (productsFetchError) {
        return <ErrorMessageBlock message={productsFetchError.message} />;
    }

    return (
        <Layout className={classes['product-layout']}>
            <ProductList products={products!.productList} />
            <Pagination
                currentPage={currentPage}
                totalPages={products!.totalPages}
            />
        </Layout>
    );
};

export default ProductListPage;
