import * as Yup from 'yup';
import recaptchaTokenSchema from '../../util/recaptchaTokenSchema';

const validationSchema = Yup.object().shape({
    login: Yup.string()
        .required('Логін повинен бути вказаний')
        .email('Логін має бути коректною поштовою адресою'),
    password: Yup.string().min(1, 'Пароль повинен бути вказаний'),
    recaptchaToken: recaptchaTokenSchema,
});

export default validationSchema;
