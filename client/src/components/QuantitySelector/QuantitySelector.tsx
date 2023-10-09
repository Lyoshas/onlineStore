import classNames from 'classnames';
import { FC, useEffect, useRef } from 'react';

import classes from './QuantitySelector.module.css';
import MinusIcon from '../UI/CartIcons/MinusIcon';
import PlusIcon from '../UI/CartIcons/PlusIcon';
import useNumberRange from '../hooks/useNumberRange';

interface QuantitySelectorProps {
    onQuantityChange: (productQuantity: number) => unknown;
    initialValue: number;
    minValue: number;
    maxValue: number;
}

const QuantitySelector: FC<QuantitySelectorProps> = (props) => {
    const isFirstRender = useRef(true);
    const {
        currentValue: productQuantity,
        incrementValue: incrementProductQuantity,
        decrementValue: decrementProductQuantity,
        setValue: setProductQuantity,
    } = useNumberRange({
        minValue: props.minValue,
        maxValue: props.maxValue,
        initialValue: props.initialValue,
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // if this is not the first render, only then call props.onQuantityChange
        props.onQuantityChange(productQuantity);
    }, [productQuantity]);

    return (
        <div className={classes['product-cart-actions__quantity-selector']}>
            <div
                className={classNames(
                    classes['quantity-selector__action-wrapper'],
                    classes['action-wrapper__remove-item']
                )}
                onClick={() => decrementProductQuantity()}
            >
                <MinusIcon />
            </div>
            <input
                type="number"
                className={classes['quantity-selector__input']}
                value={productQuantity}
                onChange={(event) => setProductQuantity(+event.target.value)}
            />
            <div
                className={classNames(
                    classes['quantity-selector__action-wrapper'],
                    classes['action-wrapper__add-item']
                )}
                onClick={() => incrementProductQuantity()}
            >
                <PlusIcon />
            </div>
        </div>
    );
};

export default QuantitySelector;
