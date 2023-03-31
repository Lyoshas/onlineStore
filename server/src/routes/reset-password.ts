import { Router } from 'express';
import { body } from 'express-validator';

import recaptchaValidation from './util/recaptchaValidation';
import passwordValidation from './util/passwordValidation';
import validateRequest from '../middlewares/validate-request';
import * as resetPasswordController from '../controllers/reset-password';

const router = Router();

// sending the link to the user's email
router.post(
    '/send-reset-token',
    recaptchaValidation,
    body('email')
        .trim()
        .notEmpty()
        .withMessage('email must not be empty')
        .isEmail()
        .withMessage('email is not correct'),
    validateRequest,
    resetPasswordController.sendResetTokenToEmail
);

router.patch(
    '/change-password',
    recaptchaValidation,
    [
        body('resetToken')
            .trim()
            .notEmpty()
            .withMessage('resetToken must not be empty')
            .isString()
            .withMessage('resetToken must be a string'),
        passwordValidation,
    ],
    validateRequest,
    resetPasswordController.changePassword
);

router.get(
    '/is-reset-token-valid/:resetToken',
    resetPasswordController.isResetTokenValid
);

export default router;
