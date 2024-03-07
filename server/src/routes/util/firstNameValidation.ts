import { body } from 'express-validator';

const firstNameValidation = body('firstName')
    .isString()
    .withMessage('the field "firstName" must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('the field "firstName" must be 1 to 50 characters long');

export default firstNameValidation;
