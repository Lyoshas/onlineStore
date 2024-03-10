import { FC, useCallback, useEffect, useState } from 'react';
import { useField } from 'formik';

import InputRadio from '../../../../components/InputRadio/InputRadio';
import deliveryMethodsClasses from '../DeliveryMethods.module.css';
import NovaPoshtaMethodClasses from './NovaPoshtaMethod.module.css';
import { useLazyGetNovaPoshtaWarehousesQuery } from '../../../../store/apis/shippingApi';
import useApiError from '../../../../components/hooks/useApiError';
import FormSelect from '../../../../components/FormSelect/FormSelect';
import Loading from '../../../../components/UI/Loading/Loading';
import CenterBlock from '../../../../components/UI/CenterBlock/CenterBlock';
import CheckoutInitialValues from '../../interfaces/CheckoutInitialValues';

const classes = { ...deliveryMethodsClasses, ...NovaPoshtaMethodClasses };

interface NovaPoshtaMethodProps {
    city: string;
}

const NovaPoshtaMethod: FC<NovaPoshtaMethodProps> = (props) => {
    const [getNovaPoshtaWarehouses, { isFetching, isError, error, data }] =
        useLazyGetNovaPoshtaWarehousesQuery();
    useApiError(isError, error, []);
    const [showWarehouses, setShowWarehouses] = useState<boolean>(false);
    const [field, meta, helpers] =
        useField<CheckoutInitialValues['deliveryMethod']>('deliveryMethod');

    const radioChangeHandler = useCallback(() => {
        getNovaPoshtaWarehouses({ city: props.city });
        setShowWarehouses(true);
    }, [getNovaPoshtaWarehouses, props.city]);

    useEffect(() => {
        if (!showWarehouses) return;
        getNovaPoshtaWarehouses({ city: props.city });
    }, [getNovaPoshtaWarehouses, showWarehouses, props.city]);

    const selectClickHandler = useCallback((newValue: string) => {
        helpers.setValue(
            { postalService: 'Нова пошта', office: newValue },
            true
        );
    }, []);

    useEffect(() => {
        if (!data) return;
        helpers.setValue({
            postalService: 'Нова пошта',
            office: data.warehouses[0],
        }, true);
    }, [data]);

    return (
        <div className={classes['nova-poshta-method']}>
            <InputRadio
                value="Нова пошта"
                id="delivery-method-nova-poshta"
                name="delivery-method"
                divClassName={classes['delivery-methods__item']}
                onChange={radioChangeHandler}
            />
            {isFetching && (
                <CenterBlock
                    className={classes['nova-poshta-method__loading-block']}
                    whiteBackground={false}
                >
                    <Loading />
                </CenterBlock>
            )}
            {!isFetching && showWarehouses && data && (
                <FormSelect
                    isRequired={true}
                    label="Choose a branch or a pickup point"
                    name="nova-poshta-warehouse"
                    options={data.warehouses}
                    defaultOption={data.warehouses[0]}
                    divClassName={classes['nova-poshta-warehouses']}
                    onChange={selectClickHandler}
                />
            )}
        </div>
    );
};

export default NovaPoshtaMethod;
