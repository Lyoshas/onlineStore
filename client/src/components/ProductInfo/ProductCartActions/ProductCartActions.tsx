import classNames from 'classnames';
import React, { useState } from 'react';

import classes from './ProductCartActions.module.css';
import Button from '../../UI/Button/Button';
import MinusIcon from '../../UI/CartIcons/MinusIcon';
import PlusIcon from '../../UI/CartIcons/PlusIcon';

enum CartProductOperation {
    INCREASE,
    DECREASE,
}

const ProductCartActions = () => {
    const [productQuantity, setProductQuantity] = useState<number>(1);

    // changing the product quantity via '+' and '-' buttons
    // this functions also makes sure the quantity is not less than 1
    const changeProductQuantity = (operation: CartProductOperation) => {
        setProductQuantity((prevQuantity) => {
            const currentQuantity =
                operation === CartProductOperation.INCREASE
                    ? prevQuantity + 1
                    : prevQuantity - 1;

            return currentQuantity > 0 ? currentQuantity : 1;
        });
    };

    const changeQuantityHandler = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        let value = +event.target.value;
        console.log(value);
        value = value < 0 ? 0 : value;
        value = value > 999 ? 999 : value;
        setProductQuantity(value);
    };

    return (
        <div className={classes['product-cart-actions']}>
            <div className={classes['product-cart-actions__quantity-selector']}>
                <div
                    className={classNames(
                        classes['quantity-selector__action-wrapper'],
                        classes['action-wrapper__remove-item']
                    )}
                    onClick={changeProductQuantity.bind(
                        null,
                        CartProductOperation.DECREASE
                    )}
                >
                    <MinusIcon />
                </div>
                <input
                    type="number"
                    className={classes['quantity-selector__input']}
                    step="1"
                    min="1"
                    value={productQuantity}
                    onChange={changeQuantityHandler}
                />
                <div
                    className={classNames(
                        classes['quantity-selector__action-wrapper'],
                        classes['action-wrapper__add-item']
                    )}
                    onClick={changeProductQuantity.bind(
                        null,
                        CartProductOperation.INCREASE
                    )}
                >
                    <PlusIcon />
                </div>
            </div>
            <Button>Add to Cart</Button>
        </div>
    );
};

export default ProductCartActions;
