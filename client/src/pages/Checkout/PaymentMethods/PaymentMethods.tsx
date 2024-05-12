import { useField } from 'formik';

import InputRadio from '../../../components/InputRadio/InputRadio';
import classes from './PaymentMethods.module.css';
import CheckoutInitialValues from '../interfaces/CheckoutInitialValues';

const PaymentMethods = () => {
    const [field, meta, helpers] =
        useField<CheckoutInitialValues['paymentMethod']>('paymentMethod');

    const paymentMethodChangeHandler = (newValue: string) => {
        helpers.setValue(newValue, true);
    };

    return (
        <section className={classes['checkout__payment-methods']}>
            <h2 className={classes['payment-methods__heading']}>
                Метод оплати
            </h2>
            <InputRadio
                value="Оплата при отриманні товару"
                id="payment-method-upon-receipt"
                name="payment-method"
                divClassName={classes['payment-methods__item']}
                onChange={paymentMethodChangeHandler}
            />
            <InputRadio
                value="Оплатити зараз"
                id="payment-method-pay-now"
                name="payment-method"
                divClassName={classes['payment-methods__item']}
                onChange={paymentMethodChangeHandler}
            />
        </section>
    );
};

export default PaymentMethods;
