import { Router } from 'express';
import { body, query } from 'express-validator';

import recaptchaValidation from './util/recaptchaValidation.js';
import passwordValidation from './util/passwordValidation.js';
import { isEmailAvailable } from '../models/signup.js';
import validateRequest from '../middlewares/validate-request.js';
import * as signupController from '../controllers/signup.js';
import firstNameValidation from './util/firstNameValidation.js';
import lastNameValidation from './util/lastNameValidation.js';

const router = Router();

router.post(
    '/sign-up',
    recaptchaValidation,
    firstNameValidation,
    lastNameValidation,
    body('email')
        .isEmail()
        .withMessage('the field "email" must be a correct email address')
        .isLength({ max: 254 })
        .withMessage('the field "email" can be up to 254 characters long')
        .custom(async (email: string) => {
            if (!(await isEmailAvailable(email))) {
                return Promise.reject('The email is already taken');
            }

            return Promise.resolve();
        }),
    passwordValidation,
    validateRequest,
    signupController.postSignUp
);

router.get(
    '/is-email-available',
    query('email')
        .isEmail()
        .withMessage('the field "email" must be a correct email address'),
    validateRequest,
    signupController.isEmailAvailable
);

export default router;
