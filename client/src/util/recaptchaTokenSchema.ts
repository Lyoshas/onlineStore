import * as Yup from 'yup';

const recaptchaTokenSchema = Yup.string()
    .required('Captcha verification is required')
    .min(1);

export default recaptchaTokenSchema;
