import { FC, useCallback, useRef, useState } from 'react';
import { useField } from 'formik';
import classNames from 'classnames';

import FormSelectClasses from './FormSelect.module.css';
import FormInputClasses from '../Input/FormInput.module.css';

const classes = { ...FormSelectClasses, ...FormInputClasses };

interface FormSelectProps {
    name: string;
    options: string[];
    label?: string;
    isRequired: boolean;
    defaultOption?: string;
    divClassName?: string;
    // 'newValue' specifies which value was selected, and 'newIndex'
    // specifies the corresponding index of the newly selected value
    onChange?: (newValue: string, newIndex: number) => void;
    value?: string;
}

const FormSelect: FC<FormSelectProps> = ({ onChange, ...props }) => {
    const [field, meta, helpers] = useField(props);
    const selectRef = useRef<HTMLSelectElement>(null);

    const selectChangeHandler: React.ChangeEventHandler<HTMLSelectElement> =
        useCallback(
            (event) => {
                field.onChange(event);
                // if (onChange) onChange(event.target.value);
                if (onChange) {
                    onChange(
                        event.target.value,
                        selectRef.current!.selectedIndex
                    );
                }
            },
            [field.onChange, onChange, selectRef]
        );

    return (
        <div
            className={classNames(classes['form-control'], props.divClassName)}
        >
            {props.label !== void 0 ? (
                <label
                    htmlFor={props.name}
                    className={classes['form-control__label']}
                >
                    {props.label}
                    {props.isRequired && (
                        <span className={classes['form-control__required']}>
                            {' '}
                            *
                        </span>
                    )}
                </label>
            ) : (
                ''
            )}
            <select
                id={props.name}
                name={props.name}
                className={classNames(
                    classes['form-input'],
                    classes['option-selector']
                )}
                defaultValue={props.defaultOption}
                value={props.value}
                onChange={selectChangeHandler}
                ref={selectRef}
            >
                {props.options.map((optionValue, i) => (
                    <option key={i}>{optionValue}</option>
                ))}
            </select>
        </div>
    );
};

export default FormSelect;
