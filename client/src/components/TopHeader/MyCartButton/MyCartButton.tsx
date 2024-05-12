import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ActionButton from '../ActionButton/ActionButton';
import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import { useLazyCountCartItemsQuery } from '../../../store/apis/cartApi';
import useApiError from '../../hooks/useApiError';
import classes from './MyCartButton.module.css';
import { cartModalActions } from '../../../store/slices/cartModal';
import { RootState } from '../../../store';
import { highlightCartActions } from '../../../store/slices/highlightCart';
import CartProduct from '../../../interfaces/CartProduct';

const MyCartButton = () => {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const shouldHighlightCart = useSelector(
        (state: RootState) => state.highlightCart.shouldHighlightCart
    );
    const localCartProducts = useSelector(
        (state: RootState) => state.localCart.products
    );
    const [
        countCartItems,
        {
            isError: isCountCartItemsErrorAPI,
            error: countCartItemsErrorAPI,
            data: countCartItemsDataAPI,
            isSuccess: isCountCountItemsSuccessAPI,
            requestId: countCartItemsRequestIdAPI,
        },
    ] = useLazyCountCartItemsQuery();
    useApiError(isCountCartItemsErrorAPI, countCartItemsErrorAPI, []);
    const [initialRequestId, setInitialRequestId] = useState<string | null>(
        null
    );
    const dispatch = useDispatch();

    useEffect(() => {
        if (!shouldHighlightCart) return;

        // If there's an animation playing, highlighting the addition of a new item to the cart,
        // schedule a function call to reset the cart highlight state.
        let timer = setTimeout(() => {
            dispatch(highlightCartActions.changeHighlightState(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [shouldHighlightCart]);

    useEffect(() => {
        if (isAuthenticated) countCartItems();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!countCartItemsRequestIdAPI || initialRequestId !== null) return;

        // setting the request id of the initial API call
        setInitialRequestId(countCartItemsRequestIdAPI);
    }, [countCartItemsRequestIdAPI, initialRequestId]);

    useEffect(() => {
        // if the request isn't successful OR this is the first request to the API to get the numbers of items in the cart, then do nothing
        if (
            !isCountCountItemsSuccessAPI ||
            initialRequestId === null ||
            countCartItemsRequestIdAPI === initialRequestId
        )
            return;

        // otherwise play an animation to highlight the fact that a new item has been added to the cart
        dispatch(highlightCartActions.changeHighlightState(true));
    }, [
        isCountCountItemsSuccessAPI,
        countCartItemsRequestIdAPI,
        initialRequestId,
    ]);

    const handleClick = () => {
        dispatch(cartModalActions.showCartModal());
    };

    // counting how many items there are in the cart
    // if the user is authenticated, the amount of items will be fetched from the API
    // otherwise products stored in localStorage will be used to calculate the exact quantity of products
    const cartItemCount: number | null =
        isAuthenticated && countCartItemsDataAPI
            ? countCartItemsDataAPI.cartItemCount
            : (Object.values(localCartProducts) as CartProduct[]).reduce(
                  (acc, elem) => acc + elem.quantity,
                  0
              );

    return (
        <ActionButton
            content={
                <Fragment>
                    Кошик{' '}
                    {cartItemCount !== null &&
                        cartItemCount > 0 &&
                        `(${cartItemCount})`}
                </Fragment>
            }
            imageURL={getStaticAssetUrl('cart-icon.svg')}
            imageAlt="Cart icon"
            onClick={handleClick}
            className={shouldHighlightCart ? classes['highlighted-cart'] : ''}
        />
    );
};

export default MyCartButton;
