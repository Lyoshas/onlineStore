import { Fragment, useCallback, useEffect, useState } from 'react';
import { useField } from 'formik';

import FormSelect from '../../../components/FormSelect/FormSelect';
import useApiError from '../../../components/hooks/useApiError';
import { useGetSupportedCitiesQuery } from '../../../store/apis/shippingApi';
import classes from './DeliveryMethods.module.css';
import NovaPoshtaMethod from './NovaPoshtaMethod/NovaPoshtaMethod';
import LoadingScreen from '../../../components/UI/LoadingScreen/LoadingScreen';

const DeliveryMethods = () => {
    const { isLoading, isError, error, data } = useGetSupportedCitiesQuery();
    useApiError(isError, error, []);
    const [chosenCity, setChosenCity] = useState<string | null>(null);
    const [field, meta, helpers] = useField('city');

    useEffect(() => {
        if (data !== void 0) setChosenCity(data.supportedCities[0]);
    }, [data]);

    const selectChangeHandler = useCallback((newValue: string) => {
        setChosenCity(newValue);
    }, [setChosenCity]);

    useEffect(() => {
        if (chosenCity !== null) helpers.setValue(chosenCity, true);
    }, [chosenCity]);

    return (
        <section className={classes['checkout__delivery-methods']}>
            <h2 className={classes['delivery-methods__heading']}>Доставка</h2>
            {isLoading && <LoadingScreen />}
            {data !== void 0 && chosenCity !== null && (
                <Fragment>
                    <FormSelect
                        isRequired={true}
                        label="Місто"
                        name="city"
                        options={data.supportedCities}
                        defaultOption={data.supportedCities[0]}
                        divClassName={classes['delivery-methods__city-picker']}
                        onChange={selectChangeHandler}
                    />
                    <NovaPoshtaMethod city={chosenCity} />
                </Fragment>
            )}
        </section>
    );
};

export default DeliveryMethods;
