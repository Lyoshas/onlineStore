import { useCallback, useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import { useSelector } from 'react-redux';

import classes from './OrderRecipient.module.css';
import FormInput from '../../../components/Input/FormInput';
import CheckoutInitialValues from '../interfaces/CheckoutInitialValues';
import { RootState } from '../../../store';
import EmailInput from './EmailInput/EmailInput';
import FormSelect from '../../../components/FormSelect/FormSelect';
import { useLazyGetOrderRecipientsQuery } from '../../../store/apis/orderApi';
import useApiError from '../../../components/hooks/useApiError';
import LoadingScreen from '../../../components/UI/LoadingScreen/LoadingScreen';

interface OrderRecipient {
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

const stringifyRecipient = (recipient: OrderRecipient) => {
    return `${recipient.firstName} ${recipient.lastName} (${recipient.phoneNumber})`;
};

const ALTERNATIVE_RECIPIENT_NAME = 'Інший одержувач';

const OrderRecipient = () => {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const [
        getOrderRecipients,
        { isLoading, isError, error, data: fetchedRecipients },
    ] = useLazyGetOrderRecipientsQuery();
    useApiError(isError, error, []);

    const [selectedRecipientOption, setSelectedRecipientOption] = useState<
        string | null
    >(null);

    const {
        setFieldValue,
        values: formikValues,
        validateField,
    } = useFormikContext<CheckoutInitialValues>();

    useEffect(() => {
        if (isAuthenticated) getOrderRecipients();
    }, [isAuthenticated]);

    const setFormikRecipient = (recipient: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
    }) => {
        setFieldValue('firstName', recipient.firstName, true);
        setTimeout(() => validateField('firstName'));
        setFieldValue('lastName', recipient.lastName, true);
        setTimeout(() => validateField('lastName'));
        setFieldValue('phoneNumber', recipient.phoneNumber, true);
        setTimeout(() => validateField('phoneNumber'));
    };

    useEffect(() => {
        if (!fetchedRecipients) return;
        if (fetchedRecipients.orderRecipients.length === 0) return;
        const defaultRecipient: OrderRecipient =
            fetchedRecipients.orderRecipients.length > 0
                ? fetchedRecipients.orderRecipients[0]
                : { firstName: '', lastName: '', phoneNumber: '' };
        setSelectedRecipientOption(stringifyRecipient(defaultRecipient));
        setFormikRecipient({
            firstName: defaultRecipient.firstName,
            lastName: defaultRecipient.lastName,
            phoneNumber: defaultRecipient.phoneNumber,
        });
    }, [fetchedRecipients]);

    const onRecipientChange = useCallback(
        (newValue: string, newIndex: number) => {
            if (!fetchedRecipients) return;
            if (newValue === ALTERNATIVE_RECIPIENT_NAME) {
                setSelectedRecipientOption(newValue);
                setFormikRecipient({
                    firstName: '',
                    lastName: '',
                    phoneNumber: '',
                });
                return;
            }
            const selectedRecipient =
                fetchedRecipients.orderRecipients[newIndex];
            setSelectedRecipientOption(stringifyRecipient(selectedRecipient));
            setFormikRecipient({
                firstName: selectedRecipient.firstName,
                lastName: selectedRecipient.lastName,
                phoneNumber: selectedRecipient.phoneNumber,
            });
        },
        [fetchedRecipients]
    );

    const changeToAlternativeRecipient = useCallback(() => {
        setSelectedRecipientOption(ALTERNATIVE_RECIPIENT_NAME);
    }, []);

    return (
        <section className={classes['checkout__contact-info']}>
            <h2>Одержувач замовлення</h2>
            {isLoading && <LoadingScreen />}
            {fetchedRecipients &&
                fetchedRecipients.orderRecipients.length > 0 &&
                selectedRecipientOption !== null && (
                    <FormSelect
                        isRequired={true}
                        name="orderRecipient"
                        options={fetchedRecipients.orderRecipients
                            .map((recipient) => stringifyRecipient(recipient))
                            .concat(ALTERNATIVE_RECIPIENT_NAME)}
                        onChange={onRecipientChange}
                        value={selectedRecipientOption}
                        divClassName={classes['checkout__order-recipient']}
                    />
                )}
            {/* isAuthenticated can be null */}
            {isAuthenticated === false && <EmailInput />}
            <FormInput
                type="text"
                isRequired={true}
                label="Ім'я"
                name="firstName"
                placeholder="Введіть своє ім'я"
                value={formikValues.firstName}
                validateOnChange={true}
                validateOnBlur={true}
                onValueChanged={changeToAlternativeRecipient}
            />
            <FormInput
                type="text"
                isRequired={true}
                label="Прізвище"
                name="lastName"
                placeholder="Введіть своє прізвище"
                value={formikValues.lastName}
                validateOnChange={true}
                validateOnBlur={true}
                onValueChanged={changeToAlternativeRecipient}
            />
            <FormInput
                type="text"
                isRequired={true}
                label="Номер телефону (напр. +380-12-345-67-89 або +380123456789)"
                name="phoneNumber"
                placeholder="Введіть свій номер телефону"
                value={formikValues.phoneNumber}
                validateOnChange={true}
                validateOnBlur={true}
                onValueChanged={changeToAlternativeRecipient}
            />
        </section>
    );
};

export default OrderRecipient;
