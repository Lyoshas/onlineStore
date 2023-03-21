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
import deriveStatusCode from '../../util/deriveStatusCode';
import passwordSchema from '../../util/passwordSchema';
import classes from './ResetPassword.module.css';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { errorActions } from '../../store/slices/error';
import ServerErrorResponse from '../../interfaces/ServerErrorResponse';
import SuccessMessage from './SuccessMessage';
import ReCAPTCHA from 'react-google-recaptcha';
import InvalidLink from './InvalidLink';

const initialValues = { password: '', confirmPassword: '', recaptchaToken: '' };
const validationSchema = Yup.object().shape({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    recaptchaToken: Yup.string()
        .required('Captcha verification is required')
        .min(1),
});

const ResetPassword = () => {
    const { resetToken } = useParams<{ resetToken: string }>();
    const [changePassword, { isLoading, isError, error, isSuccess }] =
        useChangePasswordMutation();
    const dispatch = useDispatch();
    const [showSuccessMessage, setShowSuccessMessage] =
        useState<boolean>(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [hasResetTokenExpired, setHasResetTokenExpired] =
        useState<boolean>(false);

    const statusCode = deriveStatusCode(error);

    useEffect(() => {
        if (!isError || statusCode === null) return;

        if (
            statusCode === 422 &&
            'data' in error! &&
            (error.data as ServerErrorResponse).errors[0].message ===
                'resetToken is either invalid or has expired'
        ) {
            setHasResetTokenExpired(true);
            return;
        }

        dispatch(
            errorActions.showNotificationError(
                'Something went wrong. Please try reloading the page.'
            )
        );
    }, [isError, statusCode, error]);

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
                    Change Password
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
                            <FormInput
                                isRequired={true}
                                label="New password"
                                name="password"
                                type="password"
                                placeholder="Enter your new password"
                                validationSchema={validationSchema}
                            />
                            <FormInput
                                isRequired={true}
                                label="Confirm password"
                                name="confirmPassword"
                                type="password"
                                placeholder="Enter your new password again"
                                validationSchema={validationSchema}
                            />
                            <ReCAPTCHABlock ref={recaptchaRef} />
                            <FormActions>
                                <SubmitButton
                                    label="Change password"
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
