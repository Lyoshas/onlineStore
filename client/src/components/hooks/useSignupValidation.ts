import * as Yup from 'yup';
import isEmail from 'validator/lib/isEmail';
import { useDispatch } from 'react-redux';

import useDebounce from './useDebounce';
import { errorActions } from '../../store/slices/error';

const returnNameValidation = (field: 'First name' | 'Last name') => {
    return Yup.string()
        .required(`${field} is a required field`)
        .matches(/^[a-z]+$/i, `${field} must only contain letters`)
        .min(1, `${field} must not be empty`)
        .max(50, `${field} must not exceed 50 characters`);
};

const isEmailAvailable = async (email: string): Promise<boolean> => {
    const response = await fetch(`/api/auth/is-email-available?email=${email}`);

    if (!response.ok) {
        return Promise.reject(response.status);
    }

    const { isEmailAvailable } = await response.json();

    return Promise.resolve(!!isEmailAvailable);
};

const useSignupValidation = () => {
    const dispatch = useDispatch();
    const {
        debouncedFunction: debouncedIsEmailAvailable,
        isActionExecuting: isValidatingEmail,
    } = useDebounce(isEmailAvailable, 1000);

    const validationSchema = Yup.object({
        firstName: returnNameValidation('First name'),
        lastName: returnNameValidation('Last name'),
        email: Yup.string()
            .required('Email is a required field')
            .email('Email must be correct')
            .test(
                'Email availability check',
                'Email is already in use',
                async (value) => {
                    if (value == null || !isEmail(value as string)) {
                        return Promise.resolve(true);
                    }

                    try {
                        return Promise.resolve(
                            await debouncedIsEmailAvailable(value as string)
                        );
                    } catch (statusCode) {
                        let errorMessage =
                            'Something went wrong while veryfying the email. Please reload the page.';

                        if (statusCode === 503) {
                            errorMessage = 'Wow, slow down! Too many requests!';
                        }

                        dispatch(errorActions.showNotificationError(errorMessage));

                        return Promise.resolve(false);
                    }
                }
            ),
        password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters long')
            .max(72, 'Password must not exceed 72 characters')
            .matches(/[A-Z]/, 'Must have at least 1 uppercase letter')
            .matches(/[a-z]/, 'Must have at least 1 lowercase letter')
            .matches(/[0-9]/, 'Must have at least 1 number')
            .matches(
                /[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/ ]/,
                'Must have at least 1 special character (!, @, #, etc)'
            ),
        confirmPassword: Yup.string()
            .required('Password confirmation is required')
            .oneOf([Yup.ref('password')], 'Passwords must match'),
        recaptchaToken: Yup.string()
            .required('Captcha verification is required')
    });

    return { validationSchema, isValidatingEmail };
};

export default useSignupValidation;
