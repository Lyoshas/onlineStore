import { useEffect, FC } from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';

import FormInput from '../Input/FormInput';
import useSignupValidation from '../hooks/useSignupValidation';
import ReCAPTCHABlock from '../ReCAPTCHABlock/ReCAPTCHABlock';
import PasswordTips from '../PasswordTips/PasswordTips';
import FormActions from '../FormActions/FormActions';
import SubmitButton from '../UI/SubmitButton/SubmitButton';
import { errorActions } from '../../store/slices/error';
import { IUserData, useSignUpMutation } from '../../store/apis/authApi';
import SuggestLoggingIn from '../SuggestLoggingIn/SuggestLoggingIn';
import useApiError from '../hooks/useApiError';
import SchemaContext from '../../context/validationSchema';

const SignUpForm: FC<{ onSuccessfulSignUp: () => void }> = (props) => {
    const dispatch = useDispatch();
    const { validationSchema: signupValidationSchema, isValidatingEmail } =
        useSignupValidation();
    const [signUp, { isSuccess, isError, error, isLoading }] =
        useSignUpMutation();
    const expectedErrorResponse = useApiError(isError, error, [422]);

    useEffect(() => {
        if (!isSuccess) return;

        props.onSuccessfulSignUp();
    }, [isSuccess]);

    useEffect(() => {
        if (!isError || expectedErrorResponse === null) return;

        // this error is very unlikely to occur,
        // because backend and frontend are synchronized
        // in terms of signup validation requirements
        if (expectedErrorResponse!.statusCode === 422) {
            dispatch(
                errorActions.showNotificationError(
                    'Неправильні вхідні дані. Будь ласка, перевірте свої дані або капчу.'
                )
            );
        }
    }, [isError, expectedErrorResponse, errorActions]);

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
                    <SchemaContext.Provider value={signupValidationSchema}>
                        <FormInput
                            type="text"
                            label="Власне ім'я"
                            isRequired={true}
                            name="firstName"
                            placeholder="Уведіть своє власне ім'я"
                        />
                        <FormInput
                            type="text"
                            label="Прізвище"
                            isRequired={true}
                            name="lastName"
                            placeholder="Уведіть своє прізвище"
                        />
                        <FormInput
                            type="email"
                            label="Електронна пошта"
                            isRequired={true}
                            name="email"
                            placeholder="Уведіть свою електронну пошту"
                            validateOnChange={false}
                            validateOnBlur={true}
                        />
                        <FormInput
                            type="password"
                            label="Пароль"
                            isRequired={true}
                            name="password"
                            placeholder="Уведіть свій пароль"
                            TipComponent={<PasswordTips />}
                        />
                        <FormInput
                            type="password"
                            label="Підтвердження паролю"
                            isRequired={true}
                            name="confirmPassword"
                            placeholder="Уведіть пароль ще раз"
                        />
                        <ReCAPTCHABlock />
                        <SuggestLoggingIn />
                        <FormActions>
                            <SubmitButton
                                isLoading={isLoading || isValidatingEmail}
                                label="Зареєструватися"
                            />
                        </FormActions>
                    </SchemaContext.Provider>
                </form>
            )}
        </Formik>
    );
};

export default SignUpForm;
