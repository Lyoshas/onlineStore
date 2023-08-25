import { FC } from 'react';

import Button from '../UI/Button/Button';
import classes from './AddToCartButton.module.css';
import getStaticAssetUrl from '../../util/getStaticAssetUrl';

const AddToCartButton: FC<{ productId: number }> = (props) => {
    return (
        <Button className={classes['product-item__cart-btn']}>
            <img
                className={classes['cart-btn__icon']}
                src={getStaticAssetUrl('cart-icon.svg')}
                alt="Cart"
            />
        </Button>
    );
};

export default AddToCartButton;
