import React, { FC, Fragment, useState } from 'react';
import { FieldHookConfig, useField, useFormikContext } from 'formik';
import { ObjectShape, OptionalObjectSchema } from 'yup/lib/object';
import { ValidationError } from 'yup';

import classes from './FormInput.module.css';
import ErrorMessage from '../UI/ErrorMessage/ErrorMessage';

type FormInputProps = {
    label: string | React.ReactNode;
    isRequired: boolean;
    type: string;
    placeholder: string;
    validateOnChange?: boolean; // it validates only this field
    validateOnBlur?: boolean; // it validates only this field
    validationSchema: OptionalObjectSchema<ObjectShape>;
    TipComponent?: React.ReactNode;
} & FieldHookConfig<string>;

const FormInput: FC<FormInputProps> = ({
    label,
    isRequired,
    type,
    placeholder,
    TipComponent,
    validationSchema,
    validateOnChange = true,
    validateOnBlur = true,
    ...props
}) => {
    const [field, meta, helpers] = useField(props);
    const { values: formikValues } = useFormikContext();
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const isInputInvalid = meta.touched && !!meta.error;

    // validationFields() can be applied for multiple fields that are connected, but it's required to specify the main field we're interested in so that the function can extract the needed error message if there is one
    // for most cases this function will be used to validate only one field
    const validateFields = async (
        fieldEntries: {
            [fieldName: string]: string;
        },
        returnErrorForField: string
    ) => {
        try {
            await validationSchema
                .pick(Object.keys(fieldEntries))
                .validate(fieldEntries, { abortEarly: false });

            // if we make it to this line the error message should be removed
            helpers.setError(undefined);
        } catch (e) {
            if (e instanceof ValidationError) {
                // getting the error for returnErrorFor
                let appropriateError = e.inner.find(
                    (error) => error.path === returnErrorForField
                );

                helpers.setError(appropriateError?.message);

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
        }

        return objectToValidate;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name: fieldName, value: fieldValue } = event.target;

        helpers.setValue(fieldValue, false);

        if (validateOnChange) {
            validateFields(
                returnObjectToValidate(fieldName, fieldValue),
                fieldName
            );
        }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const { name: fieldName, value: fieldValue } = event.target;

        helpers.setTouched(true, false);

        if (validateOnBlur) {
            validateFields(
                returnObjectToValidate(fieldName, fieldValue),
                fieldName
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
            {isInputInvalid && <ErrorMessage message={meta.error as string} />}
            {TipComponent}
        </div>
    );
};

export default FormInput;
