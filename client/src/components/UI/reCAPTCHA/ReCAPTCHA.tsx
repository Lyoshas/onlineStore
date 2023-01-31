import { FC, Fragment } from 'react';

import classes from './reCAPTCHA.module.css';
import { useField } from 'formik';

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
    window.onCaptchaVerify = (recaptchaToken: string) => {
        console.log('recaptcha submission!');
        console.log(recaptchaToken);
        helpers.setValue(recaptchaToken);
        helpers.setError(undefined);
    };

    window.onCaptchaExpired = () => {
        console.log('captcha has expired');
        helpers.setValue('');
        helpers.setError('Captcha has expired. Please try again.');
    };

    return (
        <Fragment>
            <div
                className={`g-recaptcha ${classes.recaptcha}`}
                data-sitekey="6LciTjkkAAAAAFMcYF8Tu68clGCWGKrEy83GrsPz"
                data-callback="onCaptchaVerify"
                data-expired-callback="onCaptchaExpired"
            ></div>
        </Fragment>
    );
};

export default ReCAPTCHA;
