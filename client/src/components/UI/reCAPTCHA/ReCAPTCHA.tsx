import { FC } from 'react';
import { useField } from 'formik';
import NpmRecaptcha from 'react-google-recaptcha';

import classes from './reCAPTCHA.module.css';

const ReCAPTCHA: FC = () => {
    const [field, meta, helpers] = useField('recaptchaToken');

    // Google reCAPTCHA API expects string the defines the name of the function in the global namespace that should be fired, so it's not possible to pass a callback to data-callback attribute
    const onCaptchaVerify = (recaptchaToken: string | null) => {
        console.log('recaptcha submission!');
        console.log(recaptchaToken);
        helpers.setValue(recaptchaToken);
        helpers.setError(undefined);
    };

    const onCaptchaExpired = () => {
        console.log('captcha has expired');
        helpers.setValue('');
        helpers.setError('Captcha has expired. Please try again.');
    };

    return (
        <NpmRecaptcha
            sitekey="6LciTjkkAAAAAFMcYF8Tu68clGCWGKrEy83GrsPz"
            onChange={onCaptchaVerify}
            onExpired={onCaptchaExpired}
            className={classes.recaptcha}
            // I tried changing the size dynamically (on window resize), but changing this prop won't re-render the captcha
            // so the only way is to set this value initially
            // more about this issue here: https://github.com/dozoisch/react-google-recaptcha/issues/69 
            size={document.body.clientWidth > 400 ? 'normal' : 'compact'}
        />
    );
};

export default ReCAPTCHA;
