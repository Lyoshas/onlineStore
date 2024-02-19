import { FC, useEffect, Fragment, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useStore } from 'react-redux';

import Button from '../UI/Button/Button';
import classes from './AddToCartButton.module.css';
import getStaticAssetUrl from '../../util/getStaticAssetUrl';
import {
    useLazyGetMaximumProductsInCartQuery,
    useUpsertCartProductMutation,
} from '../../store/apis/cartApi';
import useApiError from '../hooks/useApiError';
import { errorActions } from '../../store/slices/error';
import Loading from '../UI/Loading/Loading';
import apolloClient from '../../graphql/client';
import { cartModalActions } from '../../store/slices/cartModal';
import { RootState } from '../../store';
import { localCartActions } from '../../store/slices/localCart';
import { highlightCartActions } from '../../store/slices/highlightCart';

interface AddToCartButtonProps {
    productId: number;
    title: string;
    price: number;
    initialImageUrl: string;
    // "isInTheCart" indicates whether an item is already in the cart
    isInTheCart: boolean;
    addLabels?: boolean;
    className?: string;
}

const AddToCartButton: FC<AddToCartButtonProps> = ({
    addLabels = false,
    ...props
}) => {
    const store = useStore<RootState>();
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const [
        upsertCartProductToAPI,
        {
            isSuccess: isUpsertSuccessfulToAPI,
            isError: isUpsertErrorToAPI,
            error: productUpsertErrorToAPI,
            isLoading: isUpsertingToAPI,
        },
    ] = useUpsertCartProductMutation();
    const upsertErrorResponse = useApiError(
        isUpsertErrorToAPI,
        productUpsertErrorToAPI,
        [422, 409]
    );
    const [
        getMaximumProductsInCart,
        {
            isSuccess: isGetMaxCartProductsSuccess,
            isError: isGetMaxCartProductsError,
            error: getMaxCartProductsError,
            isFetching: isGetMaxCartProductsFetching,
            data: maxCartProductsData,
        },
    ] = useLazyGetMaximumProductsInCartQuery();
    useApiError(isGetMaxCartProductsError, getMaxCartProductsError, []);
    const dispatch = useDispatch();

    // this function will be called if a product should be added to the cart
    const modifyCache = useCallback(() => {
        // since we are trying to add this product to the cart, we need to modify the local cache so that the user sees that the product was indeed added to the cart
        // this doesn't cause any new API requests to the server
        apolloClient.cache.modify({
            id: `Product:${props.productId}`,
            fields: {
                // modifying the "isInTheCart" field to be "true", because we've just added this product to the cart
                isInTheCart() {
                    return true;
                },
            },
        });
        // updating the local cart in Redux
        dispatch(
            localCartActions.upsertCartProduct({
                productId: props.productId,
                title: props.title,
                price: props.price,
                initialImageUrl: props.initialImageUrl,
                quantity: 1,
                canBeOrdered: true,
            })
        );
        dispatch(highlightCartActions.changeHighlightState(true));
    }, [
        dispatch,
        props.productId,
        props.title,
        props.price,
        props.initialImageUrl,
    ]);

    useEffect(() => {
        // if a product was successfully added to the cart via API,
        // reflect the change in the cache
        if (isUpsertSuccessfulToAPI) modifyCache();
    }, [isUpsertSuccessfulToAPI, modifyCache]);

    useEffect(() => {
        // if a product was successfully added to the cart locally
        // reflect the change in the cache
        if (
            isGetMaxCartProductsFetching ||
            !isGetMaxCartProductsSuccess ||
            !maxCartProductsData
        )
            return;

        const maxProductsInCart = maxCartProductsData.maxProductsInCart;
        // if the user is trying to add more products to the cart than allowed,
        // show an error
        if (
            maxProductsInCart ===
            Object.keys(store.getState().localCart.products).length
        ) {
            dispatch(
                errorActions.showNotificationError(
                    `You can only add up to ${maxProductsInCart} products to the cart`
                )
            );
        } else {
            modifyCache();
        }
    }, [
        isGetMaxCartProductsFetching,
        isGetMaxCartProductsSuccess,
        maxCartProductsData?.maxProductsInCart,
        store,
        modifyCache,
    ]);

    useEffect(() => {
        if (!upsertErrorResponse) return;

        const serverErrorResponse = upsertErrorResponse.serverResponse;

        let errorMessage =
            'Something went wrong while adding the product to the cart';

        const insufficientStockMessage =
            'insufficient stock available for this product';
        const cartLimitExceeded =
            'the maximum limit of cart products has been exceeded';
        const apiError = serverErrorResponse.errors[0];

        switch (apiError.message) {
            case insufficientStockMessage:
                errorMessage =
                    insufficientStockMessage[0].toUpperCase() +
                    insufficientStockMessage.slice(1);
                break;
            case cartLimitExceeded:
                errorMessage = `You can only add up to ${
                    (apiError as any).maxProductsInCart
                } products to the cart`;
                break;
        }

        dispatch(errorActions.showNotificationError(errorMessage));
    }, [upsertErrorResponse]);

    const handleAddToCart = async () => {
        dispatch(errorActions.hideNotificationError());

        if (isAuthenticated) {
            upsertCartProductToAPI({ productId: props.productId, quantity: 1 });
        } else {
            getMaximumProductsInCart({ productId: props.productId });
        }
    };

    const showCartItems = () => {
        dispatch(cartModalActions.showCartModal());
    };

    const cartImg = (
        <img
            className={classes['cart-btn__icon']}
            src={getStaticAssetUrl(
                props.isInTheCart ? 'added-to-cart.svg' : 'add-to-cart.svg'
            )}
            alt="Cart"
        />
    );

    const className = classNames(
        classes['product-item__cart-btn'],
        addLabels && classes['text-offset'],
        props.className
    );

    return (
        <Button
            className={className}
            onClick={
                // if an item is being added to the cart, the user can't do anything
                isUpsertingToAPI || isGetMaxCartProductsFetching
                    ? function () {}
                    : // if the addition to the cart was successful OR the item was already in the cart, the user can only view existing cart items
                    props.isInTheCart
                    ? showCartItems
                    : // otherwise the user can add an item to the cart
                      handleAddToCart
            }
        >
            {isUpsertingToAPI || isGetMaxCartProductsFetching ? (
                <Loading width="30px" height="30px" />
            ) : (
                <Fragment>
                    {cartImg}
                    {addLabels
                        ? props.isInTheCart
                            ? 'In cart'
                            : 'Add to cart'
                        : ''}
                </Fragment>
            )}
        </Button>
    );
};

export default AddToCartButton;
