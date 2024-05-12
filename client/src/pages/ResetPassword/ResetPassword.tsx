import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useParams } from 'react-router-dom';
import { useRef } from 'react';

import FormActions from '../../components/FormActions/FormActions';
import FormInput from '../../components/Input/FormInput';
import ReCAPTCHABlock from '../../components/ReCAPTCHABlock/ReCAPTCHABlock';
import SubmitButton from '../../components/UI/SubmitButton/SubmitButton';
import { useChangePasswordMutation } from '../../store/apis/authApi';
import confirmPasswordSchema from '../../util/confirmPasswordSchema';
import passwordSchema from '../../util/passwordSchema';
import classes from './ResetPassword.module.css';
import { Fragment, useEffect, useState } from 'react';
import SuccessMessage from './SuccessMessage';
import ReCAPTCHA from 'react-google-recaptcha';
import InvalidLink from './InvalidLink';
import recaptchaTokenSchema from '../../util/recaptchaTokenSchema';
import useApiError from '../../components/hooks/useApiError';
import SchemaContext from '../../context/validationSchema';

const initialValues = { password: '', confirmPassword: '', recaptchaToken: '' };
const validationSchema = Yup.object().shape({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    recaptchaToken: recaptchaTokenSchema,
});

const ResetPassword = () => {
    const { resetToken } = useParams<{ resetToken: string }>();
    const [changePassword, { isLoading, isError, error, isSuccess }] =
        useChangePasswordMutation();
    const [showSuccessMessage, setShowSuccessMessage] =
        useState<boolean>(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [hasResetTokenExpired, setHasResetTokenExpired] =
        useState<boolean>(false);
    const serverErrorResponse = useApiError(isError, error, [422]);

    useEffect(() => {
        if (!isError || !serverErrorResponse) return;

        if (
            serverErrorResponse.statusCode === 422 &&
            serverErrorResponse.serverResponse.errors[0].message ===
                'resetToken або недійсний, або термін дії закінчився'
        ) {
            setHasResetTokenExpired(true);
            return;
        }
    }, [isError, serverErrorResponse]);

    useEffect(() => {
        if (isSuccess) setShowSuccessMessage(true);
    }, [isSuccess]);

    let render: React.ReactNode;

    if (showSuccessMessage) {
        render = <SuccessMessage />;
    } else if (hasResetTokenExpired) {
        render = <InvalidLink />;
    } else {
        render = (
            <Fragment>
                <h1 className={classes['change-password__heading']}>
                    Змінити пароль
                </h1>
                <Formik
                    initialValues={initialValues}
                    initialErrors={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (
                        values,
                        { setSubmitting, setFieldValue }
                    ) => {
                        setSubmitting(true);

                        await changePassword({
                            resetToken: resetToken!,
                            password: values.password,
                            recaptchaToken: values.recaptchaToken,
                        });
                        recaptchaRef.current?.reset();
                        setFieldValue('recaptchaToken', '');

                        setSubmitting(false);
                    }}
                >
                    {(formik) => (
                        <Form>
                            <SchemaContext.Provider value={validationSchema}>
                                <FormInput
                                    isRequired={true}
                                    label="Новий пароль"
                                    name="password"
                                    type="password"
                                    placeholder="Уведіть новий пароль"
                                />
                                <FormInput
                                    isRequired={true}
                                    label="Підтвердження паролю"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Уведіть новий пароль ще раз"
                                />
                            </SchemaContext.Provider>
                            <ReCAPTCHABlock ref={recaptchaRef} />
                            <FormActions>
                                <SubmitButton
                                    label="Змінити пароль"
                                    isLoading={formik.isSubmitting || isLoading}
                                />
                            </FormActions>
                        </Form>
                    )}
                </Formik>
            </Fragment>
        );
    }

    return render;
};

export default ResetPassword;
