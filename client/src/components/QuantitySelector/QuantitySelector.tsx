import classNames from 'classnames';
import { FC } from 'react';

import classes from './QuantitySelector.module.css';
import MinusIcon from '../UI/CartIcons/MinusIcon';
import PlusIcon from '../UI/CartIcons/PlusIcon';

interface QuantitySelectorProps {
    currentValue: number;
    onQuantityChange: (newQuantity: number) => void;
    className?: string;
}

const QuantitySelector: FC<QuantitySelectorProps> = (props) => {
    return (
        <div
            className={classNames(
                classes['product-cart-actions__quantity-selector'],
                props.className
            )}
        >
            <div
                className={classNames(
                    classes['quantity-selector__action-wrapper'],
                    classes['action-wrapper__remove-item']
                )}
                onClick={() => props.onQuantityChange(props.currentValue - 1)}
            >
                <MinusIcon />
            </div>
            <input
                type="number"
                className={classes['quantity-selector__input']}
                value={props.currentValue}
                onChange={(event) =>
                    props.onQuantityChange(+event.target.value)
                }
            />
            <div
                className={classNames(
                    classes['quantity-selector__action-wrapper'],
                    classes['action-wrapper__add-item']
                )}
                onClick={() => props.onQuantityChange(props.currentValue + 1)}
            >
                <PlusIcon />
            </div>
        </div>
    );
};

export default QuantitySelector;
