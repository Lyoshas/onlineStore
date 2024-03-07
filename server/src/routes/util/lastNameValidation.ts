import { body } from 'express-validator';

const lastNameValidation = body('lastName')
    .isString()
    .withMessage('the field "lastName" must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('the field "lastName" must be 1 to 50 characters long');

export default lastNameValidation;
