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
} => {
    const [currentValue, setCurrentValue] = useState<number>(initialValue);

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
    };
};

export default useNumberRange;
