import { useQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';

import ProductList from '../ProductList/ProductList';
import ButtonLink from '../UI/ButtonLink/ButtonLink';
import classes from './ExploreProductsBlock.module.css';
import { gql } from '../../__generated__';
import Loading from '../UI/Loading/Loading';
import { Fragment, useEffect } from 'react';
import { errorActions } from '../../store/slices/error';
import ErrorIcon from '../UI/Icons/ErrorIcon';

const GET_FEATURED_PRODUCTS = gql(`
    query FeaturedProducts {
        featuredProducts {
            id
            title
            price
            initialImageUrl
            additionalImageUrl
            shortDescription
            isAvailable
            isRunningOut
        }
    }
`);

const ExploreProductsBlock = () => {
    const { loading, error, data } = useQuery(GET_FEATURED_PRODUCTS);

    const dispatch = useDispatch();

    useEffect(() => {
        if (!error) return;

        dispatch(
            errorActions.showNotificationError(
                'Something went wrong while loading the products'
            )
        );
    }, [error]);

    return (
        <section className={classes['explore-products']}>
            <h2 className={classes['explore-products__heading']}>
                Explore Our Products
            </h2>
            <div className={classes['explore-products__request-status']}>
                {loading && <Loading />}
                {error && (
                    <Fragment>
                        <ErrorIcon />
                        <p>An error occurred while loading products.</p>
                    </Fragment>
                )}
            </div>
            {data && <ProductList products={data!.featuredProducts} />}
            <ButtonLink
                to="/products"
                className={classes['explore-products__more-btn']}
            >
                More Products
            </ButtonLink>
        </section>
    );
};

export default ExploreProductsBlock;
