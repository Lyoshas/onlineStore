import { ErrorMessage } from 'formik';

import ReCAPTCHA from '../UI/reCAPTCHA/ReCAPTCHA';
import formInputClasses from '../Input/FormInput.module.css';

const ReCAPTCHABlock = () => {
    return (
        <div
            className={`${formInputClasses['form-control']} ${formInputClasses['recaptcha']}`}
        >
            <ReCAPTCHA />
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
};

export default ReCAPTCHABlock;
