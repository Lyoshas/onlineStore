import { useEffect, FC } from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';

import FormInput from '../Input/FormInput';
import useSignupValidation from '../hooks/useSignupValidation';
import useFetch from '../hooks/useFetch';
import ReCAPTCHABlock from '../ReCAPTCHABlock/ReCAPTCHABlock';
import PasswordTips from '../PasswordTips/PasswordTips';
import FormActions from '../FormActions/FormActions';
import SubmitButton from '../UI/SubmitButton/SubmitButton';
import { errorActions } from '../../store/slices/error';

const SignUpForm: FC<{ onSuccessfulSignUp: () => void }> = (props) => {
    const dispatch = useDispatch();
    const {
        validationSchema: signupValidationSchema,
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

        dispatch(errorActions.showNotificationError(errorMessage));
    }, [wasRequestSuccessful]);

    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        recaptchaToken: '',
    };

    return (
        <Formik
            initialValues={initialValues}
            initialErrors={initialValues}
            initialTouched={{ recaptchaToken: true }}
            validationSchema={signupValidationSchema}
            validateOnBlur={false}
            validateOnChange={false}
            validateOnMount={false}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                await sendRequest(values);
                setSubmitting(false);
            }}
        >
            {(formik) => (
                <form onSubmit={formik.handleSubmit}>
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
                        TipComponent={<PasswordTips />}
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
                    <FormActions>
                        <SubmitButton
                            isLoading={
                                isSignupRequestLoading || isValidatingEmail
                            }
                            label="Sign Up"
                        />
                    </FormActions>
                </form>
            )}
        </Formik>
    );
};

export default SignUpForm;
