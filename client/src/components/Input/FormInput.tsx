import React, { FC, useState } from 'react';
import { FieldHookConfig, useField, useFormikContext } from 'formik';
import { ValidationError } from 'yup';
import { useContext } from 'react';
import SchemaContext from '../../context/validationSchema';

import classes from './FormInput.module.css';
import ErrorMessage from '../UI/ErrorMessage/ErrorMessage';

type FormInputProps = {
    label: string | React.ReactNode;
    isRequired: boolean;
    type: string;
    placeholder: string;
    value?: string | number;
    validateOnChange?: boolean; // it validates only this field
    validateOnBlur?: boolean; // it validates only this field
    min?: number;
    max?: number;
    step?: number;
    TipComponent?: React.ReactNode;
} & FieldHookConfig<string>;

const FormInput: FC<FormInputProps> = ({
    label,
    isRequired,
    type,
    placeholder,
    TipComponent,
    value,
    validateOnChange = true,
    validateOnBlur = true,
    // min, max, and step are used for input[type="number"]
    min,
    max,
    step,
    ...props
}) => {
    const [field, meta, helpers] = useField(props);
    const { values: formikValues, setFieldError } = useFormikContext();
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const validationSchema = useContext(SchemaContext);

    const isInputInvalid = meta.touched && !!meta.error;

    // validationFields() can be applied for multiple fields that are connected, but it's required to specify the main field we're interested in so that the function can extract the needed error message if there is one
    // for most cases this function will be used to validate only one field
    const validateFields = async (
        fieldEntries: {
            [fieldName: string]: string;
        },
        returnErrorForFields: string[]
    ) => {
        // resetting errors
        returnErrorForFields.forEach((fieldName) =>
            setFieldError(fieldName, undefined)
        );

        try {
            await validationSchema
                .pick(Object.keys(fieldEntries))
                .validate(fieldEntries, { abortEarly: false });

            // if we make it to this line the error message should be removed
            helpers.setError(undefined);
        } catch (e) {
            if (e instanceof ValidationError) {
                e.inner.forEach((error) => {
                    returnErrorForFields.forEach((fieldName) => {
                        if (error.path === fieldName) {
                            setFieldError(fieldName, error.message);
                        }
                    });
                });

                return;
            }

            throw e;
        }
    };

    const returnObjectToValidate = (fieldName: string, fieldValue: string) => {
        const objectToValidate = { [fieldName]: fieldValue };

        if (fieldName === 'confirmPassword') {
            interface FormikValues {
                [fieldName: string]: string;
                password: string;
            }

            objectToValidate.password = (formikValues as FormikValues).password;
        } else if (fieldName === 'password') {
            interface FormikValues {
                [fieldName: string]: string;
                confirmPassword: string;
            }

            objectToValidate.confirmPassword = (
                formikValues as FormikValues
            ).confirmPassword;
        }

        return objectToValidate;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name: fieldName, value: fieldValue } = event.target;

        helpers.setValue(fieldValue, false);

        if (validateOnChange) {
            validateFields(
                returnObjectToValidate(fieldName, fieldValue),
                ['password', 'confirmPassword'].includes(fieldName)
                    ? ['password', 'confirmPassword']
                    : [fieldName]
            );
        }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const { name: fieldName, value: fieldValue } = event.target;

        helpers.setTouched(true, false);

        if (validateOnBlur) {
            validateFields(
                returnObjectToValidate(fieldName, fieldValue),
                ['password', 'confirmPassword'].includes(fieldName)
                    ? ['password', 'confirmPassword']
                    : [fieldName]
            );
        }
    };

    return (
        <div
            className={`${classes['form-control']} ${
                isInputInvalid ? classes.invalid : ''
            }`}
        >
            <label
                htmlFor={field.name}
                className={classes['form-control__label']}
            >
                {label}
                {isRequired && (
                    <span className={classes['form-control__required']}>
                        {' '}
                        *
                    </span>
                )}
            </label>
            <div className={classes['form-control__input-block']}>
                <input
                    type={
                        type === 'password'
                            ? isPasswordVisible
                                ? 'text'
                                : 'password'
                            : type
                    }
                    id={field.name}
                    name={field.name}
                    placeholder={placeholder}
                    className={classes['form-input']}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    defaultValue={value}
                    min={min}
                    max={max}
                    step={step}
                />
                {type === 'password' && (
                    <img
                        src={
                            isPasswordVisible
                                ? '/show-password.png'
                                : '/hide-password.png'
                        }
                        className={classes['toggle-password-visibility-icon']}
                        onClick={() =>
                            setIsPasswordVisible(
                                (isPasswordVisible) => !isPasswordVisible
                            )
                        }
                    />
                )}
            </div>
            {isInputInvalid && <ErrorMessage>{meta.error as string}</ErrorMessage>}
            {TipComponent}
        </div>
    );
};

export default FormInput;
