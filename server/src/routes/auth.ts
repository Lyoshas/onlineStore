import { Router } from 'express';
import { body } from 'express-validator';

import authController from '../controllers/auth';
import dbPool from '../util/database';

const router = Router();

router.post(
    '/sign-up',
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
            const isEmailTaken = await dbPool.query(
                'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
                [email]
            ).then(({ rows }) => rows[0].exists);

            if (isEmailTaken) return Promise.reject('The email is already taken');;
            return Promise.resolve();
        }),
    body(
        'password',
        'the field "password" must consist of at least 8 characters, ' +
        'including at least 1 uppercase letter, 1 lowercase letter, ' +
        '1 number and 1 symbol'
    )
        .isLength({ max: 72 })
        .isStrongPassword({
            minLength: 8,
            minNumbers: 1,
            minUppercase: 1,
            minLowercase: 1,
            minSymbols: 1
        }),
    body(
        'phoneNumber',
        'the field "phoneNumber" must conform to this schema: +380-XX-XXX-XX-XX'
    )
        .optional()
        .isString()
        .withMessage('the field "phoneNumber" must be a string')
        .custom((phoneNumber: any) => {
            if (typeof phoneNumber !== 'string') return false;
            return /^\+380-\d{2}-\d{3}(-\d{2}){2}$/.test(phoneNumber);
        }),
    authController.postSignUp
);

router.get('/activate-account/:activationToken', authController.activateAccount);

router.post('/sign-in', authController.postSignIn);

// get a link to the google authorization server
router.get('/google-oauth-link', authController.getURLToGoogleAuthorizationServer);

// if the user consented, they will be redirected here
router.get('/google-oauth-callback', authController.googleOAuthCallback);

export default router;
