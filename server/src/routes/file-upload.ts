import express from 'express';
import { query } from 'express-validator';

import ensureAuthentication from '../middlewares/ensure-authentication';
import ensureAdmin from '../middlewares/ensure-admin';
import { getS3PresignedUrl } from '../controllers/file-upload';
import validateRequest from '../middlewares/validate-request';

const router = express.Router();

router.get(
    '/presigned-url',
    ensureAuthentication,
    ensureAdmin,
    query('fileName')
        .isString()
        .withMessage('must be a string')
        .isLength({ min: 30, max: 300 })
        .withMessage('must be 50 to 300 characters long')
        .custom((fileName: string) => fileName.endsWith('png'))
        .withMessage('must have the entension of .png'),
    query('mimeType')
        .isString()
        .withMessage('must be a string')
        .custom((mimetype: string) => ['image/png'].includes(mimetype))
        .withMessage('must have the mimetype of "image/png"'),
    query('contentLength')
        .isNumeric()
        .withMessage('must be a number')
        .isInt({ min: 1, max: 500 * 1024 }) // 500 KB at most
        .withMessage('must be no more than 500 KB (512,000 bytes)'),
    validateRequest,
    getS3PresignedUrl
);

export default router;
