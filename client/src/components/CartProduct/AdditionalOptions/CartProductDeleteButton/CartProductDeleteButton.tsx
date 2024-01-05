import { FC } from 'react';

import Button from '../../../UI/Button/Button';
import classes from './CartProductDeleteButton.module.css';

const CartProductDeleteButton: FC<{ onCartProductDelete: () => void }> = (
    props
) => {
    const handleCartProductDelete = () => {
        props.onCartProductDelete();
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
