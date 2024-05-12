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
import { useSignInMutation } from '../../store/apis/authApi';
import classes from './SigninForm.module.css';
import SuggestAccountCreation from '../SuggestAccountCreation/SuggestAccountCreation';
import useApiError from '../hooks/useApiError';
import SchemaContext from '../../context/validationSchema';

const SignInForm = () => {
    const initial = { login: '', password: '', recaptchaToken: '' };
    const [
        signIn,
        { isSuccess, data, isError, error, isLoading, isUninitialized },
    ] = useSignInMutation();
    // if an API error occurs, and the server doesn't return 401, 403, or 422 status codes,
    // the 'something went wrong' message will be shown
    const errorResponse = useApiError(isError, error, [401, 403, 422]);
    const dispatch = useDispatch();
    const recaptchaRef = useRef<NpmRecaptcha>(null);

    const statusCode = errorResponse && errorResponse.statusCode;

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
                        <SchemaContext.Provider value={schema}>
                            <FormInput
                                type="text"
                                label="Email"
                                isRequired={true}
                                name="login"
                                placeholder="Enter your email address"
                            />
                            <FormInput
                                type="password"
                                label="Password"
                                isRequired={true}
                                name="password"
                                placeholder="Enter your password"
                            />
                        </SchemaContext.Provider>
                        <p
                            className={
                                classes['sign-in__forgot-password-paragraph']
                            }
                        >
                            <Link
                                to="/auth/forgot-password"
                                className={`link ${classes['sign-in__forgot-password-link']}`}
                            >
                                Forgot password?
                            </Link>
                        </p>
                        <SuggestAccountCreation />
                        <ReCAPTCHABlock ref={recaptchaRef} />
                        {/* we will show the error associated with 403 in some other place */}
                        {isError && statusCode !== 403 && (
                            <Fragment>
                                <ErrorMessage centered={true}>
                                    {statusCode === 401
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
                        <Fragment>
                            <ErrorMessage centered={true}>
                                The account is not activated
                            </ErrorMessage>
                            <SuggestAccountActivation
                                login={formik.values.login}
                                password={formik.values.password}
                            />
                        </Fragment>
                    )}
                </Fragment>
            )}
        </Formik>
    );
};

export default SignInForm;
