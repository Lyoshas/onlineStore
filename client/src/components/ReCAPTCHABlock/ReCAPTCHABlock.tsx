import { forwardRef } from 'react';
import { ErrorMessage } from 'formik';

import ReCAPTCHA from '../UI/reCAPTCHA/ReCAPTCHA';
import formInputClasses from '../Input/FormInput.module.css';
import NpmRecaptcha from 'react-google-recaptcha';

const ReCAPTCHABlock = forwardRef<NpmRecaptcha>((props, ref) => {
    return (
        <div
            className={`${formInputClasses['form-control']} ${formInputClasses['recaptcha']}`}
        >
            <ReCAPTCHA ref={ref} />
            <ErrorMessage
                name="recaptcha"
                render={(msg) => (
                    <p
                        className={`
                            ${formInputClasses['form__error-message']}
                            ${formInputClasses['recaptcha']}
                        `}
                    >
                        {msg}
                    </p>
                )}
            />
        </div>
    );
});

export default ReCAPTCHABlock;
