import { Fragment, useEffect, useState } from 'react';

import ActionButton from '../ActionButton/ActionButton';
import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import { useCountCartItemsQuery } from '../../../store/apis/cartApi';
import useApiError from '../../hooks/useApiError';
import classes from './MyCartButton.module.css';

const MyCartButton = () => {
    const { isError, error, data, isSuccess, requestId } =
        useCountCartItemsQuery();
    useApiError(isError, error, []);
    const [highlightCart, setHighlightCart] = useState<boolean>(false);
    const [initialRequestId, setInitialRequestId] = useState<string | null>(
        null
    );

    useEffect(() => {
        if (!requestId || initialRequestId !== null) return;

        // setting the request id of the initial API call
        setInitialRequestId(requestId);
    }, [requestId, initialRequestId]);

    useEffect(() => {
        // if the request isn't successful OR this is the first request to the API to get the numbers of items in the cart, then do nothing
        if (
            !isSuccess ||
            initialRequestId === null ||
            requestId === initialRequestId
        )
            return;

        // otherwise play an animation to highlight the fact that a new item has been added to the cart
        setHighlightCart(true);
        const timer = setTimeout(() => setHighlightCart(false), 500);

        return () => clearTimeout(timer);
    }, [isSuccess, requestId, initialRequestId]);

    const handleClick = () => {
        console.log('showing the cart...');
    };

    return (
        <ActionButton
            content={
                <Fragment>
                    My Cart{' '}
                    {data && data.cartItemCount > 0
                        ? `(${data.cartItemCount})`
                        : ''}
                </Fragment>
            }
            imageURL={getStaticAssetUrl('cart-icon.svg')}
            imageAlt="Cart icon"
            onClick={handleClick}
            className={highlightCart ? classes['highlighted-cart'] : ''}
        />
    );
};

export default MyCartButton;
