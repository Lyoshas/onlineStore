import { useState } from 'react';
import clipNumber from '../../store/util/clipNumber';

// this custom hook manages a numerical value within a specified range,
// providing functions to increment, decrement, and set the value,
// ensuring it stays within the defined minimum and maximum bounds
const useNumberRange = ({
    minValue,
    maxValue,
    initialValue,
}: {
    minValue: number;
    maxValue: number;
    initialValue: number;
}): {
    currentValue: number;
    incrementValue: () => void;
    decrementValue: () => void;
    setValue: (currentValue: number) => void;
    isValueChanged: boolean;
} => {
    const [currentValue, _setCurrentValue] = useState<number>(initialValue);
    const [isValueChanged, setIsValueChanged] = useState<boolean>(false);

    const setCurrentValue = (newCurrentValue: number) => {
        _setCurrentValue((prevCurrentValue) => {
            setIsValueChanged((prevIsValueChanged) => {
                if (!prevIsValueChanged && newCurrentValue === prevCurrentValue) {
                    // if the previous value wasn't changed and the new value equals to the previous value, then "isValueChanged" is false because nothing changed
                    return false;
                }
                return true;
            });

            return newCurrentValue;
        });
    };

    const clipValue = (newValue: number) => {
        return clipNumber({ min: minValue, max: maxValue, value: newValue });
    };

    const incrementValue = () => {
        setCurrentValue(clipValue(currentValue + 1));
    };

    const decrementValue = () => {
        setCurrentValue(clipValue(currentValue - 1));
    };

    const setValue = (currentValue: number) => {
        setCurrentValue(clipValue(currentValue));
    };

    return {
        currentValue,
        incrementValue,
        decrementValue,
        setValue,
        isValueChanged,
    };
};

export default useNumberRange;
