import { useReducer, useEffect, FC } from 'react';
import { Formik } from 'formik';

import classes from './SignupForm.module.css';
import Button from '../UI/Button/Button';
import FormInput from '../Input/FormInput';
import ErrorNotification, {
    ErrorActionType,
    errorNotificationReducer,
} from '../UI/ErrorNotification/ErrorNotification';
import Loading from '../UI/Loading/Loading';
import useSignupValidation from '../hooks/useSignupValidation';
import useFetch from '../hooks/useFetch';
import ReCAPTCHABlock from '../ReCAPTCHABlock/ReCAPTCHABlock';

const SignUpForm: FC<{ onSuccessfulSignUp: () => void }> = (props) => {
    const [errorState, dispatchError] = useReducer(errorNotificationReducer, {
        isErrorNotificationShown: false,
        errorMessage: '',
    });
    const {
        validationSchema: signupValidationSchema,
        errorState: signupErrorState,
        isValidatingEmail,
    } = useSignupValidation();
    const {
        isRequestLoading: isSignupRequestLoading,
        sendRequest,
        wasRequestSuccessful,
        statusCode,
    } = useFetch(
        '/api/auth/sign-up',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        },
        201
    );

    useEffect(() => {
        if (wasRequestSuccessful === null) return; 
        
        // if the status code is as expected
        if (wasRequestSuccessful) {
            props.onSuccessfulSignUp();
            return;
        }

        let errorMessage: string;

        if (statusCode === 422) {
            // this error is very unlikely to occur, because backend and frontend are synchronized in terms of signup validation requirements
            errorMessage =
                'Invalid input data. Please double-check your inputs or the captcha';
        } else {
            errorMessage = 'Something went wrong. Please reload the page.';
        }

        dispatchError({
            type: ErrorActionType.SHOW_NOTIFICATION_ERROR,
            errorMessage,
        });
    }, [wasRequestSuccessful]);

    useEffect(() => {
        if (signupErrorState.isErrorNotificationShown) {
            dispatchError({
                type: ErrorActionType.SHOW_NOTIFICATION_ERROR,
                errorMessage: signupErrorState.errorMessage,
            });
        } else {
            dispatchError({ type: ErrorActionType.HIDE_ERROR });
        }
    }, [signupErrorState]);

    return (
        <Formik
            initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                recaptchaToken: '',
            }}
            initialErrors={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                recaptchaToken: '',
            }}
            initialTouched={{ recaptchaToken: true }}
            validationSchema={signupValidationSchema}
            validateOnBlur={false}
            validateOnChange={false}
            validateOnMount={false}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
                setSubmitting(true);
                await sendRequest(values);
                setSubmitting(false);
            }}
        >
            {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                    {errorState.isErrorNotificationShown && (
                        <ErrorNotification
                            message={errorState.errorMessage}
                            onClose={() =>
                                dispatchError({
                                    type: ErrorActionType.HIDE_ERROR,
                                })
                            }
                        />
                    )}
                    <FormInput
                        type="text"
                        label="First name"
                        isRequired={true}
                        name="firstName"
                        placeholder="Enter your first name"
                        // Repeating validationSchema for each FormInput is necessary to validate individual fields instead of the whole schema. Creating a context for this may be an overkill for this unlikely-to-change form.
                        validationSchema={signupValidationSchema}
                    />
                    <FormInput
                        type="text"
                        label="Last name"
                        isRequired={true}
                        name="lastName"
                        placeholder="Enter your last name"
                        validationSchema={signupValidationSchema}
                    />
                    <FormInput
                        type="email"
                        label="Email"
                        isRequired={true}
                        name="email"
                        placeholder="Enter your email"
                        validateOnChange={false}
                        validateOnBlur={true}
                        validationSchema={signupValidationSchema}
                    />
                    <FormInput
                        type="password"
                        label="Password"
                        isRequired={true}
                        name="password"
                        placeholder="Enter your password"
                        validationSchema={signupValidationSchema}
                        TipComponent={
                            <div
                                className={
                                    classes['form__password-requirements']
                                }
                            >
                                <p
                                    className={
                                        classes['password-requirements__intro']
                                    }
                                >
                                    Password must be:
                                </p>
                                <ul
                                    className={
                                        classes['password-requirements__ul']
                                    }
                                >
                                    <li>
                                        8 characters or longer, not exceeding 72
                                        characters
                                    </li>
                                    <li>Include at least 1 number</li>
                                    <li>Include at least 1 uppercase letter</li>
                                    <li>Include at least 1 lowercase letter</li>
                                    <li>
                                        Include at least 1 special character (!,
                                        @, #, etc)
                                    </li>
                                </ul>
                            </div>
                        }
                    />
                    <FormInput
                        type="password"
                        label="Confirm password"
                        isRequired={true}
                        name="confirmPassword"
                        placeholder="Write the password again"
                        validationSchema={signupValidationSchema}
                    />
                    <ReCAPTCHABlock />
                    <div className={classes['form-actions']}>
                        <Button
                            type="submit"
                            disabled={
                                formik.isSubmitting ||
                                isSignupRequestLoading ||
                                isValidatingEmail ||
                                // dirty indicates whether the form fields have been modified or not
                                !formik.dirty ||
                                // or disable the button when there are validation errors
                                Object.keys(formik.errors).length !== 0
                            }
                        >
                            {isValidatingEmail ||
                            isSignupRequestLoading ||
                            formik.isSubmitting ? (
                                <Loading width="30px" height="30px" />
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </Formik>
    );
};

export default SignUpForm;
