import { Fragment, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';

import ProductList from '../ProductList/ProductList';
import ButtonLink from '../UI/ButtonLink/ButtonLink';
import classes from './ExploreProductsBlock.module.css';
import Loading from '../UI/Loading/Loading';
import { errorActions } from '../../store/slices/error';
import ErrorIcon from '../UI/Icons/ErrorIcon';
import {
    GET_FEATURED_PRODUCTS_NO_AUTH,
    GET_FEATURED_PRODUCTS_WITH_AUTH,
} from '../../graphql/queries/getFeaturedProducts';
import { RootState } from '../../store';

const ExploreProductsBlock = () => {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const dispatch = useDispatch();
    const [
        getFeaturedProductsNoAuth,
        {
            loading: featuredProductsNoAuthLoading,
            error: featuredProductsNoAuthError,
            data: featuredProductsNoAuthData,
        },
    ] = useLazyQuery(GET_FEATURED_PRODUCTS_NO_AUTH);
    const [
        getFeaturedProductsWithAuth,
        {
            loading: featuredProductsWithAuthLoading,
            error: featuredProductsWithAuthError,
            data: featuredProductsWithAuthData,
        },
    ] = useLazyQuery(GET_FEATURED_PRODUCTS_WITH_AUTH);

    const featuredProductsLoading =
        featuredProductsNoAuthLoading || featuredProductsWithAuthLoading;
    const featuredProductsError =
        featuredProductsNoAuthError || featuredProductsWithAuthError;
    const featuredProducts =
        featuredProductsNoAuthData?.featuredProducts ||
        featuredProductsWithAuthData?.featuredProducts;

    useEffect(() => {
        // once the React app has established the authentication status of the user,
        // make a request to get featured products
        if (isAuthenticated === null) return;
        isAuthenticated
            ? getFeaturedProductsWithAuth()
            : getFeaturedProductsNoAuth();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!featuredProductsError) return;

        dispatch(
            errorActions.showNotificationError(
                'Щось пішло не так під час завантаження товарів'
            )
        );
    }, [featuredProductsError]);

    return (
        <section className={classes['explore-products']}>
            <h2 className={classes['explore-products__heading']}>
                Ознайомтеся з нашими товарами
            </h2>
            <div className={classes['explore-products__request-status']}>
                {featuredProductsLoading && <Loading />}
                {featuredProductsError && (
                    <Fragment>
                        <ErrorIcon className="icon" />
                        <p>Виникла помилка при завантаженні товарів.</p>
                    </Fragment>
                )}
            </div>
            {featuredProducts ? (
                <ProductList
                    products={featuredProducts.map((product) => ({
                        ...product,
                        userRating: product.userRating || null,
                    }))}
                />
            ) : (
                ''
            )}
            <ButtonLink
                to="/products"
                className={classes['explore-products__more-btn']}
            >
                Більше товарів
            </ButtonLink>
        </section>
    );
};

export default ExploreProductsBlock;
