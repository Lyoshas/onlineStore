import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import useNumberRange from './useNumberRange';
import { errorActions } from '../../store/slices/error';

const useCartProductQuantity = (productQuantity: number) => {
    const dispatch = useDispatch();
    const {
        currentValue: currentProductQuantity,
        incrementValue: incrementCurrentProductQuantity,
        decrementValue: decrementCurrentProductQuantity,
        setValue: setCurrentProductQuantity,
        isValueChanged: isCurrentProductQuantityChanged,
    } = useNumberRange({
        minValue: 1,
        maxValue: 32767,
        initialValue: productQuantity,
    });
    const [lastValidProductQuantity, setLastValidProductQuantity] =
        useState<number>(productQuantity);

    const rollbackCurrentProductQuantity = useCallback(() => {
        setCurrentProductQuantity(lastValidProductQuantity);
    }, [lastValidProductQuantity]);

    useEffect(() => {
        if (currentProductQuantity === lastValidProductQuantity) return;
        dispatch(errorActions.hideNotificationError());
    }, [currentProductQuantity, lastValidProductQuantity]);

    return {
        currentProductQuantity,
        incrementCurrentProductQuantity,
        decrementCurrentProductQuantity,
        setCurrentProductQuantity,
        lastValidProductQuantity,
        setLastValidProductQuantity,
        rollbackCurrentProductQuantity,
        isCurrentProductQuantityChanged,
    };
};

export default useCartProductQuantity;
