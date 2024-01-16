import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../../../UI/Button/Button';
import classes from './CartProductDeleteButton.module.css';
import { localCartActions } from '../../../../store/slices/localCart';
import { RootState } from '../../../../store';

const CartProductDeleteButton: FC<{
    productId: number;
    onCartProductDeleteWithAuth: () => void;
}> = (props) => {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    const handleCartProductDelete = () => {
        if (isAuthenticated) {
            props.onCartProductDeleteWithAuth();
        } else {
            dispatch(
                localCartActions.deleteCartProduct({
                    productId: props.productId,
                })
            );
        }
    };

    return (
        <Button
            className={classes['cart-product__delete-from-cart-btn']}
            onClick={handleCartProductDelete}
        >
            <img
                className={classes['delete-from-cart-btn__img']}
                src={
                    'https://onlinestore-react-assets.s3.eu-north-1.amazonaws.com/delete-icon.svg'
                }
                alt="Delete icon"
            />
            Delete
        </Button>
    );
};

export default CartProductDeleteButton;
