import { FC } from 'react';

import Button from '../UI/Button/Button';
import classes from './AddToCartButton.module.css';
import getStaticAssetUrl from '../../util/getStaticAssetUrl';
import ButtonLink from '../UI/ButtonLink/ButtonLink';

interface AddToCartButtonProps {
    productId: number;
    // "isInTheCart" indicates whether an item is already in the cart
    isInTheCart?: boolean;
}

const AddToCartButton: FC<AddToCartButtonProps> = (props) => {
    const cartImg = (
        <img
            className={classes['cart-btn__icon']}
            src={getStaticAssetUrl(
                props.isInTheCart ? 'added-to-cart.svg' : 'add-to-cart.svg'
            )}
            alt="Cart"
        />
    );

    // if the "isInTheCart" property wasn't provided, then the user isn't authenticated
    return props.isInTheCart == null ? (
        <ButtonLink
            to="/auth/sign-in"
            className={classes['product-item__cart-btn']}
        >
            {cartImg}
        </ButtonLink>
    ) : (
        <Button className={classes['product-item__cart-btn']}>{cartImg}</Button>
    );
};

export default AddToCartButton;
