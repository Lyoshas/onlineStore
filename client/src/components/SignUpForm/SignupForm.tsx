import { useReducer, useState, useEffect } from 'react';
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

    return (
        <Formik
            initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
            }}
            initialErrors={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
            }}
            validationSchema={signupValidationSchema}
            validateOnBlur={false}
            validateOnChange={false}
            validateOnMount={false}
            onSubmit={(values, { setSubmitting, resetForm }) => {
                setSubmitting(true);
                setIsLoading(true);

                console.log('trying to submit');
                console.log(values);

                setTimeout(() => {
                    setSubmitting(false);
                    setIsLoading(false);
                    resetForm();
                }, 3000);
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
                                    <li>8 characters or longer</li>
                                    <li>Include at least 1 number</li>
                                    <li>Include at least 1 uppercase letter</li>
                                    <li>Include at least 1 lowercase letter</li>
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
                            {isLoading ? (
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
