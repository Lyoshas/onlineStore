import axios from 'axios';

import RecaptchaValidationResult from '../interfaces/RecaptchaValidationResult.js';

export const isRecaptchaValid = async (
    recaptchaToken: string,
    remoteIP?: string
): Promise<RecaptchaValidationResult> => {
    const { data } = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify?' +
            new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY as string,
                response: recaptchaToken,
                // user's IP address
                remoteip: remoteIP || '',
            }).toString()
    );

    // more about possible errors: https://developers.google.com/recaptcha/docs/verify
    return { success: data.success, errors: data['error-codes'] };
};
