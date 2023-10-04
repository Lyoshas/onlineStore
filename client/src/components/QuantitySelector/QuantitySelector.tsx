import classNames from 'classnames';
import { FC, useEffect, useState, useRef } from 'react';

import classes from './QuantitySelector.module.css';
import MinusIcon from '../UI/CartIcons/MinusIcon';
import PlusIcon from '../UI/CartIcons/PlusIcon';

interface QuantitySelectorProps {
    onQuantityChange: (productQuantity: number) => unknown;
    initialValue: number;
}

const QuantitySelector: FC<QuantitySelectorProps> = (props) => {
    const isFirstRender = useRef(true);
    let [productQuantity, setProductQuantity] = useState<number>(props.initialValue);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // if this is not the first render, only then call props.onQuantityChange
        props.onQuantityChange(productQuantity);
    }, [productQuantity]);

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
        <div className={classes['product-cart-actions__quantity-selector']}>
            <div
                className={classNames(
                    classes['quantity-selector__action-wrapper'],
                    classes['action-wrapper__remove-item']
                )}
                onClick={() =>
                    setProductQuantity((prevQuantity) => prevQuantity - 1)
                }
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
                onClick={() =>
                    setProductQuantity((prevQuantity) => prevQuantity + 1)
                }
            >
                <PlusIcon />
            </div>
        </div>
    );
};

export default QuantitySelector;
