import { Form, Formik } from 'formik';
import { FC, Fragment, useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import ReCAPTCHA from 'react-google-recaptcha';

import Card from '../../components/UI/Card/Card';
import classes from './ForgotPassword.module.css';
import FormInput from '../../components/Input/FormInput';
import ReCAPTCHABlock from '../../components/ReCAPTCHABlock/ReCAPTCHABlock';
import SubmitButton from '../../components/UI/SubmitButton/SubmitButton';
import { useRequestResetTokenMutation } from '../../store/apis/authApi';
import deriveStatusCode from '../../util/deriveStatusCode';
import { errorActions } from '../../store/slices/error';
import ErrorMessage from '../../components/UI/ErrorMessage/ErrorMessage';
import SuccessMessage from './SuccessMessage';

const schema = Yup.object().shape({
    email: Yup.string()
        .required('Email must be provided')
        .email('Email must be correct'),
    recaptchaToken: Yup.string().required('Captcha challenge must be solved'),
});
const initialValues = { email: '', recaptchaToken: '' };

const ForgotPassword: FC = () => {
    const [
        sendResetToken,
        { isError, error, isLoading: isRequestLoading, isSuccess },
    ] = useRequestResetTokenMutation();
    const [serverErrorResponse, setServerErrorResponse] = useState<
        string | null
    >();
    const dispatch = useDispatch();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const statusCode = deriveStatusCode(error);

    useEffect(() => {
        if (!isError) return;

        interface ServerErrorResponse {
            errors: {
                message: string;
                field: string;
            }[];
        }

        const errorMessage = 'There is no user with the corresponding email';
        if (
            statusCode === 422 &&
            'data' in error! && // if error is of type 'FetchBaseQueryError'
            (error.data as ServerErrorResponse).errors.some((error) =>
                error.message.includes(errorMessage)
            )
        ) {
            setServerErrorResponse(errorMessage);
            return;
        }

        dispatch(
            errorActions.showNotificationError(
                'Something went wrong. Please try reloading the page.'
            )
        );
    }, [statusCode, isError, error]);

    return (
        <div className="flex-wrapper">
            <Card className={classes['forgot-password-block']}>
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
                                        <ErrorMessage
                                            message={serverErrorResponse}
                                            centered={true}
                                        />
                                    )}
                                    <SubmitButton
                                        label="Send a link"
                                        isLoading={
                                            formik.isSubmitting ||
                                            isRequestLoading
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
            </Card>
        </div>
    );
};

export default ForgotPassword;
