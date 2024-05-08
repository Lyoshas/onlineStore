import { Router } from 'express';
import { body, query } from 'express-validator';

import validateRequest from '../middlewares/validate-request.js';
import * as fundraisingCampaignController from '../controllers/fundraising-campaign.js';
import FundraisingCampaignModel from '../models/fundraising-campaign.js';
import ensureAuthentication from '../middlewares/ensure-authentication.js';

const router = Router();
const fundraisingCampaignModel = new FundraisingCampaignModel();

router.get(
    '/',
    query('status')
        .custom((status) => ['ongoing', 'finished'].includes(status))
        .withMessage('status must be either "ongoing" or "finished"'),
    validateRequest,
    fundraisingCampaignController.getFundraisingCampaigns
);

router.post(
    '/pending-transactions',
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

export default router;
