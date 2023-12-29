import { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useUpsertCartProductMutation } from '../../../store/apis/cartApi';
import QuantitySelector from '../../QuantitySelector/QuantitySelector';
import classes from './CartProductQuantity.module.css';
import useApiError from '../../hooks/useApiError';
import useDebounce from '../../hooks/useDebounce';
import useNumberRange from '../../hooks/useNumberRange';
import { cartModalActions } from '../../../store/slices/cartModal';
import { errorActions } from '../../../store/slices/error';

const CartProductQuantity: FC<{
    productId: number;
    productQuantity: number;
}> = (props) => {
    const dispatch = useDispatch();
    const {
        currentValue: currentProductQuantity,
        incrementValue: incrementProductQuantity,
        decrementValue: decrementProductQuantity,
        setValue: setProductQuantity,
        isValueChanged: isProductQuantityChanged,
    } = useNumberRange({
        minValue: 1,
        maxValue: 32767,
        initialValue: props.productQuantity,
    });
    // "lastValidQuantity" will be used to roll back the QuantitySelector component's displayed product quantity to the last valid number if the user attempts to add too many products to the cart
    const [lastValidQuantity, setLastValidQuantity] = useState<number>(
        props.productQuantity
    );
    const [
        upsertCartProduct,
        {
            isSuccess: isUpsertSuccessfulToAPI,
            isError: isUpsertErrorToAPI,
            error: productUpsertErrorToAPI,
            isLoading: isUpsertingToCartViaAPI,
        },
    ] = useUpsertCartProductMutation();
    const upsertErrorResponse = useApiError(
        isUpsertErrorToAPI,
        productUpsertErrorToAPI,
        [409]
    );
    const {
        debouncedFunction: debouncedUpsertCartProduct,
        cancelDebouncedExecution: cancelDebouncedUpsertCartProduct,
    } = useDebounce(
        useCallback(
            (newQuantity: number) => {
                upsertCartProduct({
                    productId: props.productId,
                    quantity: newQuantity,
                });
            },
            [props.productId]
        ),
        500,
        false
    );

    useEffect(() => {
        if (currentProductQuantity !== lastValidQuantity) return;
        // if the user changed the product quantity too fast, cancel the debounced call to the API
        cancelDebouncedUpsertCartProduct();
    }, [currentProductQuantity, lastValidQuantity]);

    useEffect(() => {
        // if the product quantity wasn't changed using "incrementValue", "decrementValue", "setValue",
        // or if the current product quantity is equal to the last known valid product quantity
        // then do nothing
        if (
            !isProductQuantityChanged ||
            currentProductQuantity === lastValidQuantity
        )
            return;

        // otherwise schedule to add the product to the cart
        debouncedUpsertCartProduct(currentProductQuantity);
    }, [isProductQuantityChanged, currentProductQuantity, lastValidQuantity]);

    useEffect(() => {
        dispatch(
            cartModalActions.setIsApiRequestLoading(isUpsertingToCartViaAPI)
        );
    }, [isUpsertingToCartViaAPI]);

    useEffect(() => {
        if (!isUpsertSuccessfulToAPI) return;
        setLastValidQuantity(props.productQuantity);
    }, [isUpsertSuccessfulToAPI, props.productQuantity]);

    const rollbackProductQuantity = useCallback(() => {
        setProductQuantity(lastValidQuantity);
    }, [lastValidQuantity]);

    useEffect(() => {
        if (upsertErrorResponse === null) return;

        const apiErrorMessage =
            upsertErrorResponse.serverResponse.errors[0].message;
        let errorMessageToDisplay: string;

        switch (apiErrorMessage) {
            case 'insufficient stock available for this product':
                errorMessageToDisplay =
                    apiErrorMessage[0].toUpperCase() + apiErrorMessage.slice(1);
                break;
            case 'more products are added to the cart than allowed':
                errorMessageToDisplay = `Only ${
                    (upsertErrorResponse.serverResponse.errors[0] as any)
                        .maximumAllowedProducts
                } units of this product can be added to the cart`;
                break;
            default:
                errorMessageToDisplay =
                    'Something went wrong while changing the product quantity';
                break;
        }

        rollbackProductQuantity();
        dispatch(errorActions.showNotificationError(errorMessageToDisplay));
    }, [upsertErrorResponse]);

    useEffect(() => {
        // whenever the user changes the cart product quantity, hide any errors that were previously shown
        // HOWEVER, if currentProductQuantity === lastValidQuantity, then don't hide any errors
        if (currentProductQuantity === lastValidQuantity) return;
        dispatch(errorActions.hideNotificationError());
    }, [currentProductQuantity, currentProductQuantity, lastValidQuantity]);

    return (
        <QuantitySelector
            currentValue={currentProductQuantity}
            onIncrementValue={incrementProductQuantity}
            onDecrementValue={decrementProductQuantity}
            onSetValue={setProductQuantity}
            className={classes['cart-product-footer__quantity-selector-block']}
        />
    );
};

export default CartProductQuantity;
