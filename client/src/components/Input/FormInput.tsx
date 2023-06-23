import React, { FC, useState } from 'react';
import { FieldHookConfig, useField, useFormikContext } from 'formik';
import { ValidationError } from 'yup';
import { useContext } from 'react';

import classes from './FormInput.module.css';
import ErrorMessage from '../UI/ErrorMessage/ErrorMessage';
import FileInfo from '../../interfaces/FileInfo';
import SchemaContext from '../../context/validationSchema';

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
    const { values: formikValues, setFieldError, setFieldValue } = useFormikContext();
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

    const returnObjectToValidate = (fieldName: string, fieldValue: any) => {
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

    // if we're dealing with a basic input (e.g. type="text"), this function is going to return the input name and value
    // if we're dealing with a file input, it's going to return the input value as { size: number; type: string }
    const getInputData = (
        inputElement: HTMLInputElement
    ): { inputName: string; inputValue: string | FileInfo } => {
        let inputName = inputElement.name;
        let inputValue: string | FileInfo = inputElement.value;

        if (
            type === 'file' &&
            inputElement.files &&
            inputElement.files.length > 0
        ) {
            const { size, type } = inputElement.files[0];
            inputValue = { size, type };
        }

        return { inputName, inputValue };
    };

    // this function is used to validate an input separately, not the whole form
    // however, if we are dealing with passwords, the 'password' and 'confirmPassword' fields will be validated together
    const validateSeparateInput = (
        inputName: string,
        inputValue: string | FileInfo
    ) => {
        validateFields(
            returnObjectToValidate(inputName, inputValue),
            ['password', 'confirmPassword'].includes(inputName)
                ? ['password', 'confirmPassword']
                : [inputName]
        );
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { inputName, inputValue } = getInputData(event.target);

        setFieldValue(inputName, inputValue);

        if (validateOnChange) {
            validateSeparateInput(inputName, inputValue);
        }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const { inputName, inputValue } = getInputData(event.target);

        helpers.setTouched(true, false);

        if (validateOnBlur) {
            validateSeparateInput(inputName, inputValue);
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
            {isInputInvalid && (
                <ErrorMessage>{meta.error as string}</ErrorMessage>
            )}
            {TipComponent}
        </div>
    );
};

export default FormInput;
