import { Fragment } from 'react';

import ActionButton from '../ActionButton/ActionButton';
import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import { useCountCartItemsQuery } from '../../../store/apis/cartApi';
import useApiError from '../../hooks/useApiError';

const MyCartButton = () => {
    const { isError, error, data } = useCountCartItemsQuery();
    useApiError(isError, error, []);

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
        />
    );
};

export default MyCartButton;
