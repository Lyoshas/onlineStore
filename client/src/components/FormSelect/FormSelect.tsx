import { FC } from 'react';

import FormSelectClasses from './FormSelect.module.css';
import FormInputClasses from '../Input/FormInput.module.css';
import { FieldHookConfig, useField } from 'formik';

const classes = { ...FormSelectClasses, ...FormInputClasses };

interface FormSelectProps {
    name: string;
    options: string[];
    label: string;
    isRequired: boolean;
    defaultOption?: string;
}

const FormSelect: FC<FormSelectProps> = (props) => {
    const [field, meta, helpers] = useField(props);

    return (
        <div className={classes['form-control']}>
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
            <select
                id={props.name}
                name={props.name}
                className={classes['form-input']}
                defaultValue={props.defaultOption}
                onChange={field.onChange}
            >
                {props.options.map((optionValue, i) => (
                    <option key={i}>{optionValue}</option>
                ))}
            </select>
        </div>
    );
};

export default FormSelect;
