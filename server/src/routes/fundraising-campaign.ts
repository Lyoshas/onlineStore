import { Router } from 'express';
import { body, query } from 'express-validator';

import validateRequest from '../middlewares/validate-request.js';
import * as fundraisingCampaignController from '../controllers/fundraising-campaign.js';
import FundraisingCampaignModel from '../models/fundraising-campaign.js';
import ensureAuthentication from '../middlewares/ensure-authentication.js';
import liqpayDataValidation from './util/liqpayDataValidation.js';
import liqpaySignatureValidation from './util/liqpaySignatureValidation.js';
import camelCaseObject from '../util/camelCaseObject.js';
import { base64Decode } from '../util/base64.js';

const router = Router();
const fundraisingCampaignModel = new FundraisingCampaignModel();

router.get(
    '/fundraising-campaigns',
    query('status')
        .custom((status) => ['ongoing', 'finished'].includes(status))
        .withMessage('status must be either "ongoing" or "finished"'),
    validateRequest,
    fundraisingCampaignController.getFundraisingCampaigns
);

router.post(
    '/fundraising-campaigns/pending-transactions',
    ensureAuthentication,
    body(
        'campaignId',
        'campaignId must be a number pointing at an existing fundraising campaign'
    )
        .isNumeric()
        .bail()
        .custom(async (campaignId: number) => {
            const exists =
                await fundraisingCampaignModel.fundraisingCampaignExists(
                    campaignId
                );
            return exists ? Promise.resolve() : Promise.reject();
        }),
    body(
        'donationAmount',
        'donationAmount must be a number that is greater than 100'
    )
        .isNumeric()
        .bail()
        .customSanitizer((donationAmount) =>
            parseFloat(donationAmount).toFixed(2)
        )
        .custom((donationAmount) => donationAmount >= 100),
    validateRequest,
    fundraisingCampaignController.createPendingTransaction
);

router.post(
    '/fundraising-campaign/callback',
    liqpayDataValidation,
    validateRequest,
    liqpaySignatureValidation,
    validateRequest,
    body('data').customSanitizer((data: string) => {
        // transforming the 'data' parameter to an object
        return camelCaseObject(JSON.parse(base64Decode(data)));
    }),
    body('data.orderId')
        .isNumeric()
        // LiqPay returns 'orderId' as a string, so we need to transform it to a number
        .customSanitizer((orderId: string) => +orderId)
        .withMessage('must be a numeric value'),
    body('data.action').isString().withMessage('must be a string'),
    body('data.status').isString().withMessage('must be a string'),
    body('data.errCode').optional().isString().withMessage('must be a string'),
    validateRequest,
    fundraisingCampaignController.donationCallback
);

export default router;
