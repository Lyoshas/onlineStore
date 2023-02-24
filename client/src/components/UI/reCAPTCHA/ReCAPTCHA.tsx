import { FC } from 'react';
import { useField } from 'formik';
import NpmRecaptcha from 'react-google-recaptcha';

import classes from './reCAPTCHA.module.css';

type OnCaptchaVerify = (recaptchaToken: string) => void;

declare global {
    interface Window {
        onCaptchaVerify: OnCaptchaVerify;
        onCaptchaExpired: () => void;
    }
}

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
        />
    );
};

export default ReCAPTCHA;
