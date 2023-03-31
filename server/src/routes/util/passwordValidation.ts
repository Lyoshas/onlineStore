import { body } from 'express-validator';

const passwordValidation = body(
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
        minSymbols: 1,
    });

export default passwordValidation;
