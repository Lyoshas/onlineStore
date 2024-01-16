import { FC, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import useCartProductQuantity from '../../../hooks/useCartProductQuantity';
import { useUpsertCartProductMutation } from '../../../../store/apis/cartApi';
import QuantitySelector from '../../../QuantitySelector/QuantitySelector';
import useDebounce from '../../../hooks/useDebounce';
import useApiError from '../../../hooks/useApiError';
import { errorActions } from '../../../../store/slices/error';
import { cartModalActions } from '../../../../store/slices/cartModal';

const CartProductQuantityWithAuth: FC<{
    productId: number;
    productQuantity: number;
}> = (props) => {
    const dispatch = useDispatch();
    const {
        currentProductQuantity,
        lastValidProductQuantity,
        setCurrentProductQuantity,
        setLastValidProductQuantity,
        rollbackCurrentProductQuantity,
        isCurrentProductQuantityChanged,
    } = useCartProductQuantity(props.productQuantity);
    const [
        upsertCartProductToAPI,
        {
            isSuccess: isUpsertSuccessfulToAPI,
            isError: isUpsertErrorToAPI,
            error: productUpsertErrorToAPI,
            isLoading: isUpsertingToCartViaAPI,
            originalArgs: upsertOriginalArgs,
        },
    ] = useUpsertCartProductMutation();
    const {
        debouncedFunction: debouncedProductUpsert,
        cancelDebouncedExecution: cancelDebouncedProductUpsert,
    } = useDebounce(
        useCallback(
            (newQuantity: number) => {
                upsertCartProductToAPI({
                    productId: props.productId,
                    quantity: newQuantity,
                });
            },
            [props.productId]
        ),
        500,
        false
    );
    const upsertErrorResponse = useApiError(
        isUpsertErrorToAPI,
        productUpsertErrorToAPI,
        [409]
    );

    useEffect(() => {
        dispatch(
            cartModalActions.setIsApiRequestLoading(isUpsertingToCartViaAPI)
        );
    }, [isUpsertingToCartViaAPI]);

    useEffect(() => {
        // if the user has changed the current product quantity
        if (
            isCurrentProductQuantityChanged &&
            currentProductQuantity !== lastValidProductQuantity
        ) {
            debouncedProductUpsert(currentProductQuantity);
        }
    }, [
        isCurrentProductQuantityChanged,
        currentProductQuantity,
        lastValidProductQuantity,
    ]);

    useEffect(() => {
        if (currentProductQuantity === lastValidProductQuantity) {
            cancelDebouncedProductUpsert();
        }
    }, [
        currentProductQuantity,
        lastValidProductQuantity,
        cancelDebouncedProductUpsert,
    ]);

    useEffect(() => {
        if (
            isUpsertSuccessfulToAPI &&
            upsertOriginalArgs?.quantity === currentProductQuantity
        ) {
            setLastValidProductQuantity(currentProductQuantity);
        }
    }, [isUpsertSuccessfulToAPI, currentProductQuantity, upsertOriginalArgs]);

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

        rollbackCurrentProductQuantity();
        dispatch(errorActions.showNotificationError(errorMessageToDisplay));
    }, [upsertErrorResponse]);

    return (
        <QuantitySelector
            currentValue={currentProductQuantity}
            onQuantityChange={(newQuantity) => {
                setCurrentProductQuantity(newQuantity);
            }}
        />
    );
};

export default CartProductQuantityWithAuth;
