import { cookie } from 'express-validator';

const refreshTokenValidation = cookie('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('refreshToken must not be empty');

export default refreshTokenValidation;
