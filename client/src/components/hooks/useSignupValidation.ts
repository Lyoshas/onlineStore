import * as Yup from 'yup';
import isEmail from 'validator/lib/isEmail';
import { useDispatch } from 'react-redux';

import useDebounce from './useDebounce';
import { errorActions } from '../../store/slices/error';
import passwordSchema from '../../util/passwordSchema';
import confirmPasswordSchema from '../../util/confirmPasswordSchema';
import recaptchaTokenSchema from '../../util/recaptchaTokenSchema';

const returnNameValidation = (field: "Власне ім'я" | 'Прізвище') => {
    return Yup.string()
        .required(`${field} є обов'язковим полем`)
        .matches(/^[a-zа-яґєії']+$/i, `${field} має містити лише літери`)
        .min(1, `${field} не повинно бути пустим`)
        .max(50, `${field} не повинно перевищувати 50 символів`);
};

const isEmailAvailable = async (email: string): Promise<boolean> => {
    const baseUrl =
        process.env.NODE_ENV === 'development'
            ? '/api'
            : 'https://api.onlinestore-potapchuk.click';

    const response = await fetch(
        `${baseUrl}/auth/is-email-available?email=${encodeURIComponent(email)}`
    );

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
    } = useDebounce(isEmailAvailable, 1000, true);

    const validationSchema = Yup.object({
        firstName: returnNameValidation("Власне ім'я"),
        lastName: returnNameValidation('Прізвище'),
        email: Yup.string()
            .required('Електронна пошта має бути вказана')
            .email('Електронна пошта має бути коректною')
            .test(
                'Email availability check',
                'Електронна пошта вже зайнята',
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
                            'Щось пішло не так під час верифікації електронної пошти. Спробуйте перезавантажити сторінку.';

                        if (statusCode === 503) {
                            errorMessage =
                                'Ого, повільніше! Занадто багато запитів!';
                        }

                        dispatch(
                            errorActions.showNotificationError(errorMessage)
                        );

                        return Promise.resolve(false);
                    }
                }
            ),
        password: passwordSchema,
        confirmPassword: confirmPasswordSchema,
        recaptchaToken: recaptchaTokenSchema,
    });

    return { validationSchema, isValidatingEmail };
};

export default useSignupValidation;
