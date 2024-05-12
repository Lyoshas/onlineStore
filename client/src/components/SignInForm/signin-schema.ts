import * as Yup from 'yup';
import recaptchaTokenSchema from '../../util/recaptchaTokenSchema';

const validationSchema = Yup.object().shape({
    login: Yup.string()
        .required('Login is a required field')
        .email('Login must be an email'),
    password: Yup.string().min(1, 'Password must not be empty'),
    recaptchaToken: recaptchaTokenSchema,
});

export default validationSchema;
