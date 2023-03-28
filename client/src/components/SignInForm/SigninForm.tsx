import { Form, Formik } from 'formik';
import { Fragment, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import NpmRecaptcha from 'react-google-recaptcha';
import { Link } from 'react-router-dom';

import FormInput from '../Input/FormInput';
import ReCAPTCHABlock from '../ReCAPTCHABlock/ReCAPTCHABlock';
import FormActions from '../FormActions/FormActions';
import SubmitButton from '../UI/SubmitButton/SubmitButton';
import { authActions } from '../../store/slices/auth';
import ErrorMessage from '../UI/ErrorMessage/ErrorMessage';
import schema from './signin-schema';
import SuggestAccountActivation from '../SuggestAccountActivation/SuggestAccountActivation';
import { errorActions } from '../../store/slices/error';
import { useSignInMutation } from '../../store/apis/authApi';
import deriveStatusCode from '../../util/deriveStatusCode';
import classes from './SigninForm.module.css';

const SignInForm = () => {
    const initial = { login: '', password: '', recaptchaToken: '' };
    const [
        signIn,
        { isSuccess, data, isError, error, isLoading, isUninitialized },
    ] = useSignInMutation();
    const dispatch = useDispatch();
    const recaptchaRef = useRef<NpmRecaptcha>(null);

    const statusCode = deriveStatusCode(error);

    useEffect(() => {
        if (!isError) return;
        if (typeof statusCode === 'number' && statusCode < 500) return;

        dispatch(
            errorActions.showNotificationError(
                'Something went wrong while signing in. Please reload the page.'
            )
        );
    }, [isError, statusCode]);

    useEffect(() => {
        if (!isSuccess) return;
        if (!data) return;

        dispatch(authActions.updateAccessToken(data.accessToken));
    }, [isSuccess, data]);

    return (
        <Formik
            initialValues={initial}
            initialErrors={initial}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting, setFieldValue }) => {
                setSubmitting(true);

                let { login, password, recaptchaToken } = values;

                if (/^\+380\d{9}$/.test(login)) {
                    // sanitize the phone number
                    // the server expects the phone number to confirm to this schema: +380-12-345-67-89
                    login = [
                        login.slice(0, 4),
                        login.slice(4, 6),
                        login.slice(6, 9),
                        login.slice(9, 11),
                        login.slice(11),
                    ].join('-');
                }

                await signIn({ login, password, recaptchaToken });

                setFieldValue('recaptchaToken', '');
                recaptchaRef.current?.reset();

                setSubmitting(false);
            }}
        >
            {(formik) => (
                <Fragment>
                    <Form>
                        <FormInput
                            type="text"
                            label="Email or phone number (e.g. +380-50-123-45-67)"
                            isRequired={true}
                            name="login"
                            placeholder="Enter your email or phone number"
                            validationSchema={schema}
                        />
                        <FormInput
                            type="password"
                            label="Password"
                            isRequired={true}
                            name="password"
                            placeholder="Enter your password"
                            validationSchema={schema}
                        />
                        <p
                            className={
                                classes['sign-in__forgot-password-paragraph']
                            }
                        >
                            <Link
                                to="/forgot-password"
                                className={`link ${classes['sign-in__forgot-password-link']}`}
                            >
                                Forgot password?
                            </Link>
                        </p>
                        <p className={classes['sign-in__signup-paragraph']}>
                            Don't have an account?{' '}
                            <Link to="/sign-up" className="link">
                                Sign up
                            </Link>
                        </p>
                        <ReCAPTCHABlock ref={recaptchaRef} />
                        {isError && (
                            <Fragment>
                                <ErrorMessage centered={true}>
                                    {statusCode === 403
                                        ? 'The account is not activated'
                                        : statusCode === 401
                                        ? 'Invalid login or password'
                                        : statusCode === 422
                                        ? 'Wrong inputs'
                                        : 'Something went wrong'}
                                </ErrorMessage>
                            </Fragment>
                        )}
                        <FormActions>
                            <SubmitButton
                                label="Sign In"
                                isLoading={isLoading}
                            />
                        </FormActions>
                    </Form>
                    {statusCode === 403 && (
                        <SuggestAccountActivation
                            login={formik.values.login}
                            password={formik.values.password}
                        />
                    )}
                </Fragment>
            )}
        </Formik>
    );
};

export default SignInForm;
