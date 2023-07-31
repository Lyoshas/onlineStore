import Router from 'express';
import { body } from 'express-validator';

import recaptchaValidation from './util/recaptchaValidation';
import validateRequest from '../middlewares/validate-request';
import * as signinController from '../controllers/signin';
import refreshTokenValidation from './util/refreshTokenValidation';

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
    refreshTokenValidation,
    validateRequest,
    signinController.acquireNewAccessToken
);

export default router;
