import { useDispatch } from 'react-redux';
import { FC, useCallback, useEffect, useState } from 'react';

import QuantitySelector from '../../../QuantitySelector/QuantitySelector';
import useCartProductQuantity from '../../../hooks/useCartProductQuantity';
import { useLazyCheckIfSafeToAddProductToCartQuery } from '../../../../store/apis/cartApi';
import useApiError from '../../../hooks/useApiError';
import useDebounce from '../../../hooks/useDebounce';
import { errorActions } from '../../../../store/slices/error';
import { cartModalActions } from '../../../../store/slices/cartModal';
import { localCartActions } from '../../../../store/slices/localCart';

const CartProductQuantityNoAuth: FC<{
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
        checkIfSafeToAddProductToCart,
        {
            isFetching: isCheckingProductAvailability,
            isError: isErrorCheckingProductAvailability,
            error: checkingProductAvailabilityError,
            isSuccess: isSuccessCheckingProductAvailability,
            data: checkProductAvailabilityData,
            // we need to store the last provided arguments
            originalArgs: checkProductAvailabilityOriginalArgs,
            requestId: checkProductAvailabilityRequestId,
        },
    ] = useLazyCheckIfSafeToAddProductToCartQuery();
    const [lastValidRequestId, setLastValidRequestId] = useState<string | null>(
        checkProductAvailabilityRequestId || null
    );
    const {
        debouncedFunction: debouncedProductAvailabilityCheck,
        cancelDebouncedExecution: cancelDebouncedProductAvailabilityCheck,
    } = useDebounce(
        useCallback(
            (newQuantity: number) => {
                checkIfSafeToAddProductToCart({
                    productId: props.productId,
                    quantityToAdd: newQuantity,
                });
            },
            [props.productId]
        ),
        500,
        false
    );
    useApiError(
        isErrorCheckingProductAvailability,
        checkingProductAvailabilityError,
        // if the status code is not in the 2xx range, an error notification will be shown
        []
    );

    useEffect(() => {
        dispatch(
            cartModalActions.setIsApiRequestLoading(
                isCheckingProductAvailability
            )
        );
    }, [isCheckingProductAvailability]);

    useEffect(() => {
        if (
            isCurrentProductQuantityChanged &&
            currentProductQuantity !== lastValidProductQuantity
        ) {
            debouncedProductAvailabilityCheck(currentProductQuantity);
        }
    }, [
        isCurrentProductQuantityChanged,
        currentProductQuantity,
        lastValidProductQuantity,
    ]);

    useEffect(() => {
        if (currentProductQuantity === lastValidProductQuantity) {
            cancelDebouncedProductAvailabilityCheck();
        }
    }, [
        currentProductQuantity,
        lastValidProductQuantity,
        cancelDebouncedProductAvailabilityCheck,
    ]);

    useEffect(() => {
        if (
            isCheckingProductAvailability ||
            !isSuccessCheckingProductAvailability ||
            !checkProductAvailabilityData ||
            !checkProductAvailabilityOriginalArgs ||
            checkProductAvailabilityOriginalArgs.quantityToAdd !==
                currentProductQuantity
        )
            return;

        if (
            // if the API server returned that the specified product is available
            checkProductAvailabilityData.safeToAdd
        ) {
            setLastValidProductQuantity(currentProductQuantity);
            dispatch(
                localCartActions.updateCartProductQuantity({
                    productId: props.productId,
                    newQuantity: currentProductQuantity,
                })
            );
        } else if (
            // otherwise roll back to the last valid product quantity
            checkProductAvailabilityRequestId !== lastValidRequestId
        ) {
            rollbackCurrentProductQuantity();
            dispatch(
                errorActions.showNotificationError(
                    checkProductAvailabilityData.reason ===
                        'ExceededMaxOrderQuantity'
                        ? `One user can order only up to ${checkProductAvailabilityData.maxOrderQuantity} instances of this product`
                        : 'Insufficient stock available for this product'
                )
            );
        }

        setLastValidRequestId(checkProductAvailabilityRequestId || null);
    }, [
        isCheckingProductAvailability,
        isSuccessCheckingProductAvailability,
        checkProductAvailabilityData,
        checkProductAvailabilityOriginalArgs,
        currentProductQuantity,
        checkProductAvailabilityRequestId,
        lastValidRequestId,
    ]);

    return (
        <QuantitySelector
            currentValue={currentProductQuantity}
            onQuantityChange={(newQuantity) => {
                setCurrentProductQuantity(newQuantity);
            }}
        />
    );
};

export default CartProductQuantityNoAuth;
