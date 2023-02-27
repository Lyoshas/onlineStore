import { Form, Formik } from 'formik';
import { useEffect, useReducer } from 'react';
import { useDispatch } from 'react-redux';

import FormInput from '../Input/FormInput';
import ReCAPTCHABlock from '../ReCAPTCHABlock/ReCAPTCHABlock';
import FormActions from '../FormActions/FormActions';
import SubmitButton from '../UI/SubmitButton/SubmitButton';
import useFetch from '../hooks/useFetch';
import { authActions } from '../../store/slices/auth';
import ErrorNotification, {
    ErrorActionType,
    errorNotificationReducer,
} from '../UI/ErrorNotification/ErrorNotification';
import ErrorMessage from '../UI/ErrorMessage/ErrorMessage';
import schema from './signin-schema';

const SignInForm = () => {
    const [errorState, dispatchError] = useReducer(errorNotificationReducer, {
        isErrorNotificationShown: false,
        errorMessage: '',
    });
    const initial = { login: '', password: '', recaptchaToken: '' };
    const {
        JSONResponse,
        isRequestLoading,
        unexpectedRequestError,
        sendRequest,
        wasRequestSuccessful: wasLoginSuccessful,
        statusCode,
    } = useFetch('/api/auth/sign-in', { method: 'POST' }, 200);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!unexpectedRequestError) return;

        dispatchError({
            type: ErrorActionType.SHOW_NOTIFICATION_ERROR,
            errorMessage: unexpectedRequestError,
        });
    }, [unexpectedRequestError]);

    useEffect(() => {
        if (!wasLoginSuccessful) return;

        if (typeof JSONResponse.accessToken !== 'string') {
            throw new Error('JSONResponse.accessToken must be a string');
        }

        dispatch(
            authActions.updateAccessToken(JSONResponse.accessToken as string)
        );

        return;
    }, [wasLoginSuccessful, statusCode]);

    return (
        <Formik
            initialValues={initial}
            initialErrors={initial}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);

                let { login, password } = values;

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

                await sendRequest({ login, password });

                setSubmitting(false);
            }}
        >
            {(formik) => (
                <Form>
                    {errorState.isErrorNotificationShown && (
                        <ErrorNotification
                            message={unexpectedRequestError as string}
                            onClose={() =>
                                dispatchError({
                                    type: ErrorActionType.HIDE_ERROR,
                                })
                            }
                        />
                    )}
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
                    <ReCAPTCHABlock />
                    {/* it can be null, so we check with the === operator */}
                    {wasLoginSuccessful === false &&
                        unexpectedRequestError === null && (
                            <ErrorMessage
                                message={
                                    statusCode === 403
                                        ? 'The account is not activated'
                                        : 'Invalid login or password'
                                }
                                centered={true}
                            />
                        )}
                    <FormActions>
                        <SubmitButton
                            label="Sign In"
                            isLoading={isRequestLoading}
                        />
                    </FormActions>
                </Form>
            )}
        </Formik>
    );
};

export default SignInForm;
