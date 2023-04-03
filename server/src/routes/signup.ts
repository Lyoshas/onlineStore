import { Router } from 'express';
import { body, query } from 'express-validator';

import recaptchaValidation from './util/recaptchaValidation';
import passwordValidation from './util/passwordValidation';
import { isEmailAvailable } from '../models/signup';
import dbPool from '../services/postgres.service';
import validateRequest from '../middlewares/validate-request';
import * as signupController from '../controllers/signup';

const router = Router();

router.post(
    '/sign-up',
    recaptchaValidation,
    body('firstName')
        .isString()
        .withMessage('the field "firstName" must be a string')
        .isLength({ min: 1, max: 50 })
        .withMessage('the field "firstName" must be 1 to 50 characters long'),
    body('lastName')
        .isString()
        .withMessage('the field "lastName" must be a string')
        .isLength({ min: 1, max: 50 })
        .withMessage('the field "lastName" must be 1 to 50 characters long'),
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
    body('phoneNumber')
        .optional()
        .isString()
        .withMessage('the field "phoneNumber" must be a string')
        .custom((phoneNumber: any) => {
            if (typeof phoneNumber !== 'string') return false;
            return /^\+380-\d{2}-\d{3}(-\d{2}){2}$/.test(phoneNumber);
        })
        .withMessage(
            'the field "phoneNumber" must conform to this schema: ' +
                '+380-XX-XXX-XX-XX'
        )
        .custom(async (phoneNumber: string) => {
            const isPhoneNumberTaken: boolean = await dbPool
                .query(
                    'SELECT EXISTS(SELECT 1 FROM users WHERE phone_number = $1)',
                    [phoneNumber]
                )
                .then(({ rows }) => rows[0].exists);

            if (isPhoneNumberTaken) {
                return Promise.reject('The phone number is already taken');
            }
            return Promise.resolve();
        }),
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
