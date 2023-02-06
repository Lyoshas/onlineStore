import { useReducer, useState, useEffect } from 'react';
import { ErrorMessage, Formik } from 'formik';

import classes from './SignupForm.module.css';
import Button from '../UI/Button/Button';
import FormInput from '../Input/FormInput';
import ErrorNotification, {
    ErrorActionType,
    errorNotificationReducer,
} from '../UI/ErrorNotification/ErrorNotification';
import Loading from '../UI/Loading/Loading';
import useSignupValidation from '../hooks/useSignupValidation';
import ReCAPTCHA from '../UI/reCAPTCHA/ReCAPTCHA';
import formInputClasses from '../Input/FormInput.module.css';
import SuccessfulSignupMessage from './SuccessfulSignupMessage';

const SignUpForm = () => {
    const [errorState, dispatchError] = useReducer(errorNotificationReducer, {
        isErrorNotificationShown: false,
        errorMessage: '',
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {
        validationSchema: signupValidationSchema,
        errorState: signupErrorState,
        isValidatingEmail,
    } = useSignupValidation();
    // if "true" - show the success message (like "check your email for further instructions"), otherwise show the signup form
    const [wasSignupSuccessful, setWasSignupSuccessful] =
        useState<boolean>(false);

    useEffect(() => {
        setIsLoading(isValidatingEmail);
    }, [isValidatingEmail]);

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

    let jsxToRender;

    // if the signup validation went well and the user has sent the form
    if (wasSignupSuccessful) {
        jsxToRender = <SuccessfulSignupMessage />;
    } else {
        jsxToRender = (
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
                    setIsLoading(true);

                    try {
                        const response = await fetch('/api/auth/sign-up', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ ...values }),
                        });

                        if (response.status === 201) {
                            setWasSignupSuccessful(true);
                            return;
                        }

                        let errorMessage: string;

                        if (response.status === 422) {
                            // this error is very unlikely to occur, because backend and frontend are synchronized in terms of signup validation requirements
                            errorMessage =
                                'Invalid input data. Please double-check your inputs or the captcha';
                        } else {
                            errorMessage =
                                'Something went wrong. Please reload the page.';
                        }

                        dispatchError({
                            type: ErrorActionType.SHOW_NOTIFICATION_ERROR,
                            errorMessage,
                        });
                    } catch (e) {
                        console.log(e);
                        dispatchError({
                            type: ErrorActionType.SHOW_NOTIFICATION_ERROR,
                            errorMessage:
                                'Something went wrong. Please reload the page',
                        });
                    } finally {
                        setSubmitting(false);
                        setIsLoading(false);
                    }
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
                                            classes[
                                                'password-requirements__intro'
                                            ]
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
                                            8 characters or longer, not
                                            exceeding 72 characters
                                        </li>
                                        <li>Include at least 1 number</li>
                                        <li>
                                            Include at least 1 uppercase letter
                                        </li>
                                        <li>
                                            Include at least 1 lowercase letter
                                        </li>
                                        <li>
                                            Include at least 1 special character
                                            (!, @, #, etc)
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
                        <div
                            className={`${formInputClasses['form-control']} ${formInputClasses['recaptcha']}`}
                        >
                            <ReCAPTCHA />
                            <ErrorMessage
                                name="recaptcha"
                                render={(msg) => (
                                    <p
                                        className={`
                                    ${formInputClasses['form__error-message']}
                                    ${formInputClasses['recaptcha']}
                                `}
                                    >
                                        {msg}
                                    </p>
                                )}
                            />
                        </div>
                        <div className={classes['form-actions']}>
                            <Button
                                type="submit"
                                disabled={
                                    formik.isSubmitting ||
                                    isLoading ||
                                    // dirty indicates whether the form fields have been modified or not
                                    !formik.dirty ||
                                    // or disable the button when there are validation errors
                                    Object.keys(formik.errors).length !== 0
                                }
                            >
                                {isLoading || formik.isSubmitting ? (
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
    }

    return jsxToRender;
};

export default SignUpForm;
