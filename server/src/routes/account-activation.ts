import { Router } from 'express';
import { body } from 'express-validator';

import * as accountActivationController from '../controllers/account-activation.js';
import recaptchaValidation from './util/recaptchaValidation.js';
import validateRequest from '../middlewares/validate-request.js';

const router = Router();

router.patch(
    '/activate-account/:activationToken',
    accountActivationController.activateAccount
);

router.post(
    '/resend-activation-link',
    recaptchaValidation,
    body('login').trim().notEmpty().withMessage('login must not be empty'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('password must not be empty'),
    validateRequest,
    accountActivationController.resendActivationLink
);

export default router;
