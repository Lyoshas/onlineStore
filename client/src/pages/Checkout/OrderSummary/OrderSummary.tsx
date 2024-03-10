import { FC } from 'react';
import { useFormikContext } from 'formik';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import classes from './OrderSummary.module.css';
import Button from '../../../components/UI/Button/Button';
import calculateCartTotalPrice from '../../../store/util/calculateCartTotalPrice';
import { RootState } from '../../../store';
import formatCurrencyUAH from '../../../store/util/formatCurrencyUAH';

const OrderSummary: FC<{ divClassName?: string }> = (props) => {
    const { errors: formikErrors, submitForm } = useFormikContext();
    const cartProducts = useSelector(
        (state: RootState) => state.localCart.products
    );

    const totalPrice = calculateCartTotalPrice(cartProducts);

    return (
        <div
            className={classNames(classes['order-summary'], props.divClassName)}
        >
            <h2 className={classes['order-summary__heading']}>Summary</h2>
            <div>
                <div className={classes['order-summary__delivery']}>
                    <span
                        className={
                            classes['order-summary__delivery-price-name']
                        }
                    >
                        Delivery price:
                    </span>
                    <span
                        className={
                            classes['order-summary__delivery-price-value']
                        }
                    >
                        according to the carrier's tariffs
                    </span>
                </div>
                <div className={classes['order-summary__total-price']}>
                    <span
                        className={classes['order-summary__total-price-name']}
                    >
                        Total price:
                    </span>
                    <span
                        className={classes['order-summary__total-price-value']}
                    >
                        {formatCurrencyUAH(totalPrice)}
                    </span>
                </div>
            </div>
            <Button
                className={classes['order-summary__order-button']}
                colorTheme={2}
                disabled={Object.keys(formikErrors).length > 0}
                onClick={submitForm}
            >
                Confirm the order
            </Button>
        </div>
    );
};

export default OrderSummary;
