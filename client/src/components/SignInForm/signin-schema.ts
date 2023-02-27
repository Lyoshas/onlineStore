import * as Yup from 'yup';

const yupValidate = async (schema: Yup.StringSchema, value: string) => {
    try {
        await schema.validate(value);
        return Promise.resolve(true);
    } catch (e) {
        return Promise.resolve(false);
    }
};

const validationSchema = Yup.object().shape({
    login: Yup.string()
        .required('Login is a required field')
        .test(
            'is-email-or-phone',
            'Login must be an email or a phone number',
            async (value) => {
                console.log('checking the login');
                if (!value) return false;

                try {
                    return Promise.resolve(
                        (await yupValidate(Yup.string().email(), value)) ||
                            /^\+380-\d{2}-\d{3}(-\d{2}){2}$/.test(value) ||
                            /^\+380\d{9}$/.test(value)
                    );
                } catch {
                    return Promise.resolve(false);
                }
            }
        ),
    password: Yup.string().min(1, 'Password must not be empty'),
    recaptchaToken: Yup.string().required('Captcha verification is required'),
});

export default validationSchema;
