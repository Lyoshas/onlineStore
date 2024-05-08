import { body } from 'express-validator';
import { base64Decode, base64Encode } from '../../util/base64.js';

const liqpayDataValidation = body(
    'data',
    'the field "data" must contain a JSON object encoded in base64'
)
    .isString()
    .withMessage('the field "data" must be a string')
    .isBase64()
    .bail()
    .customSanitizer((data: string) => base64Decode(data))
    .isJSON()
    // encoding it again because we need need it to create a signature
    .customSanitizer((data: string) => base64Encode(data));

export default liqpayDataValidation;
