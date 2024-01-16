import { FC } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../store';
import CartProductQuantityWithAuth from './CartProductQuantityWithAuth/CartProductQuantityWithAuth';
import CartProductQuantityNoAuth from './CartProductQuantityNoAuth/CartProductQuantityNoAuth';

const CartProductQuantity: FC<{
    productId: number;
    productQuantity: number;
}> = (props) => {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    if (isAuthenticated === null) return <></>;

    return isAuthenticated ? (
        <CartProductQuantityWithAuth
            productId={props.productId}
            productQuantity={props.productQuantity}
        />
    ) : (
        <CartProductQuantityNoAuth
            productId={props.productId}
            productQuantity={props.productQuantity}
        />
    );
};

export default CartProductQuantity;
