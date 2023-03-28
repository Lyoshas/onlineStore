import { useEffect, FC } from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import FormInput from '../Input/FormInput';
import useSignupValidation from '../hooks/useSignupValidation';
import ReCAPTCHABlock from '../ReCAPTCHABlock/ReCAPTCHABlock';
import PasswordTips from '../PasswordTips/PasswordTips';
import FormActions from '../FormActions/FormActions';
import SubmitButton from '../UI/SubmitButton/SubmitButton';
import { errorActions } from '../../store/slices/error';
import { IUserData, useSignUpMutation } from '../../store/apis/authApi';
import classes from './SignupForm.module.css';

const SignUpForm: FC<{ onSuccessfulSignUp: () => void }> = (props) => {
    const dispatch = useDispatch();
    const { validationSchema: signupValidationSchema, isValidatingEmail } =
        useSignupValidation();
    const [signUp, signupResults] = useSignUpMutation();

    useEffect(() => {
        if (!signupResults.isSuccess) return;

        props.onSuccessfulSignUp();
    }, [signupResults.isSuccess]);

    useEffect(() => {
        if (!signupResults.isError) return;

        let errorMessage = 'Something went wrong. Please reload the page.';

        if ('data' in signupResults.error) {
            // this error is very unlikely to occur,
            // becausebackend and frontend are synchronized
            // in terms of signup validation requirements
            if (signupResults.error?.status === 422) {
                errorMessage =
                    'Invalid input data. Please double-check your inputs or the captcha.';
            }
        }

        dispatch(errorActions.showNotificationError(errorMessage));
    }, [signupResults.isError, signupResults.error, errorActions]);

    const initialValues: IUserData = {
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
                await signUp(values);
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
                    <p className={classes['signup-form__signin-paragraph']}>
                        Already have an account?{' '}
                        <Link to="/sign-in" className="link">Sign in</Link>
                    </p>
                    <FormActions>
                        <SubmitButton
                            isLoading={
                                signupResults.isLoading || isValidatingEmail
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
