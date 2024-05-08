import { body } from 'express-validator';
import { createLiqPaySignature } from '../../models/liqpay.js';

const liqpaySignatureValidation = body('signature')
    .isString()
    .withMessage('the field "signature" must be a string')
    .custom((providedSignature: string, { req }) => {
        // we have to verify the signature that the user provided
        // to do that, we need to hash this value:
        // liqpay_private_key + req.body.data + liqpay_private_key
        // and then compare the hash we've generated with the hash in req.body
        // if there's a match, the request is genuine
        const genuineSignature = createLiqPaySignature(req.body.data);

        if (genuineSignature !== providedSignature) {
            return Promise.reject('the provided signature is invalid');
        }

        return Promise.resolve();
    });

export default liqpaySignatureValidation;
