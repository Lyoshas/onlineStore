import Router from 'express';
import { body, cookie } from 'express-validator';

import recaptchaValidation from './util/recaptchaValidation';
import validateRequest from '../middlewares/validate-request';
import * as signinController from '../controllers/signin';

const router = Router();

router.post(
    '/sign-in',
    recaptchaValidation,
    body('login')
        .notEmpty()
        .withMessage('the field "login" must be specified')
        .isString()
        .withMessage('the field "login" must be a string'),
    body('password')
        .notEmpty()
        .withMessage('the field "password" must be specified')
        .isString()
        .withMessage('the field "password" must be a string'),
    validateRequest,
    signinController.postSignIn
);

router.get(
    '/refresh',
    cookie('refreshToken')
        .trim()
        .notEmpty()
        .withMessage('refreshToken must not be empty'),
    validateRequest,
    signinController.acquireNewAccessToken
);

export default router;
