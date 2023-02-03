import { Router, Request } from 'express';
import { body, query } from 'express-validator';

import * as authController from '../controllers/auth';
import { isEmailAvailable, isRecaptchaValid } from '../models/auth';
import dbPool from '../util/database';

const router = Router();

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

router.get(
    '/is-email-available',
    query('email')
        .isEmail()
        .withMessage('the field "email" must be a correct email address'),
    authController.isEmailAvailable
);

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
            if ( !(await isEmailAvailable(email)) ) {
                return Promise.reject('The email is already taken');
            }

            return Promise.resolve();
        }),
    body(
        'password',
        'the field "password" must consist of at least 8 characters, ' +
        'not exceeding 72 characters, ' +
        'including at least 1 uppercase letter, 1 lowercase letter, ' +
        '1 number and 1 special character'
    )
        .isLength({ max: 72 })
        .isStrongPassword({
            minLength: 8,
            minNumbers: 1,
            minUppercase: 1,
            minLowercase: 1,
            minSymbols: 1
        }),
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
            const isPhoneNumberTaken: boolean = await dbPool.query(
                'SELECT EXISTS(SELECT 1 FROM users WHERE phone_number = $1)',
                [phoneNumber]
            ).then(({ rows }) => rows[0].exists);

            if (isPhoneNumberTaken) {
                return Promise.reject('The phone number is already taken');
            }
            return Promise.resolve();
        }),
    authController.postSignUp
);

router.patch('/activate-account/:activationToken', authController.activateAccount);

router.post('/sign-in', authController.postSignIn);

// get a link to the google/facebook authorization server
router.get(
    '/oauth-link/:authorizationServerName',
    authController.getURLToOAuthAuthorizationServer
);

// if the user consented, they will be redirected here
router.get('/oauth-callback', authController.OAuthCallback);

export default router;
