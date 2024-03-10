import { FC } from 'react';
import classNames from 'classnames';

import classes from './InputRadio.module.css';

interface InputRadioProps {
    id: string;
    value: string;
    name: string;
    divClassName?: string;
    inputClassName?: string;
    onChange?: (value: string) => void;
}

const InputRadio: FC<InputRadioProps> = (props) => {
    const radioChangeHandler = () => {
        if (!props.onChange) return;
        props.onChange(props.value);
    };

    return (
        <div className={classNames(classes['radio-block'], props.divClassName)}>
            <input
                type="radio"
                value={props.value}
                id={props.id}
                name={props.name}
                className={classNames(
                    classes['radio-block__input'],
                    props.inputClassName
                )}
                onChange={radioChangeHandler}
            />
            <label htmlFor={props.id} className={classes['radio-block__label']}>
                {props.value}
            </label>
        </div>
    );
};

export default InputRadio;
