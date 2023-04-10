import { Form, Formik } from 'formik';
import { FC, Fragment, useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import ReCAPTCHA from 'react-google-recaptcha';

import classes from './ForgotPassword.module.css';
import FormInput from '../../components/Input/FormInput';
import ReCAPTCHABlock from '../../components/ReCAPTCHABlock/ReCAPTCHABlock';
import SubmitButton from '../../components/UI/SubmitButton/SubmitButton';
import { useRequestResetTokenMutation } from '../../store/apis/authApi';
import ErrorMessage from '../../components/UI/ErrorMessage/ErrorMessage';
import SuccessMessage from './SuccessMessage';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import recaptchaTokenSchema from '../../util/recaptchaTokenSchema';
import useApiError from '../../components/hooks/useApiError';

const schema = Yup.object().shape({
    email: Yup.string()
        .required('Email must be provided')
        .email('Email must be correct'),
    recaptchaToken: recaptchaTokenSchema,
});
const initialValues = { email: '', recaptchaToken: '' };

const ForgotPassword: FC = () => {
    const [
        sendResetToken,
        { isError, error, isLoading: isRequestLoading, isSuccess },
    ] = useRequestResetTokenMutation();
    const expectedErrorResponse = useApiError(isError, error, [422]);
    const [serverErrorResponse, setServerErrorResponse] = useState<
        string | null
    >();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const statusCode =
        expectedErrorResponse && expectedErrorResponse.statusCode;

    useEffect(() => {
        if (!isError || statusCode === null) return;

        const errorMessage = 'There is no user with the corresponding email';
        if (
            statusCode === 422 &&
            expectedErrorResponse?.serverResponse.errors.some((error) =>
                error.message.includes(errorMessage)
            )
        ) {
            setServerErrorResponse(errorMessage);
            return;
        }
    }, [statusCode, isError]);

    return (
        <CenterBlock>
            {isSuccess ? (
                <SuccessMessage />
            ) : (
                <Fragment>
                    <h1 className={classes['forgot-password__heading']}>
                        Forgot Password
                    </h1>
                    <Formik
                        initialValues={initialValues}
                        initialErrors={initialValues}
                        validationSchema={schema}
                        onSubmit={async (
                            values,
                            { setSubmitting, setFieldValue }
                        ) => {
                            setSubmitting(true);

                            await sendResetToken(values);
                            recaptchaRef.current?.reset();
                            setFieldValue('recaptchaToken', '');

                            setSubmitting(false);
                        }}
                    >
                        {(formik) => (
                            <Form>
                                <FormInput
                                    type="email"
                                    isRequired={true}
                                    placeholder="Enter your email"
                                    validationSchema={schema}
                                    label="Email"
                                    name="email"
                                />
                                <ReCAPTCHABlock ref={recaptchaRef} />
                                {serverErrorResponse && (
                                    <ErrorMessage centered={true}>
                                        {serverErrorResponse}
                                    </ErrorMessage>
                                )}
                                <SubmitButton
                                    label="Send a link"
                                    isLoading={
                                        formik.isSubmitting || isRequestLoading
                                    }
                                    className={
                                        classes[
                                            'forgot-password__submit-button_centered'
                                        ]
                                    }
                                />
                            </Form>
                        )}
                    </Formik>
                </Fragment>
            )}
        </CenterBlock>
    );
};

export default ForgotPassword;
