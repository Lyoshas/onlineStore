import { body } from 'express-validator';
import { Request } from 'express';

import { isRecaptchaValid } from '../../models/recaptcha.js';

const recaptchaValidation = body('recaptchaToken')
    .not()
    .isEmpty()
    .withMessage('recaptchaToken must be specified')
    .isString()
    .withMessage('recaptchaToken must be a string')
    .custom(async (recaptchaToken: string, { req }) => {
        const validationInfo = await isRecaptchaValid(
            recaptchaToken,
            (req as Request).socket.remoteAddress
        );

        if (validationInfo.success) return Promise.resolve();
        return Promise.reject(validationInfo.errors);
    });

export default recaptchaValidation;
