import { Router } from 'express';
import { query } from 'express-validator';

import validateRequest from '../middlewares/validate-request.js';
import * as fundraisingCampaignController from '../controllers/fundraising-campaign.js';

const router = Router();

router.get(
    '/',
    query('status')
        .custom((status) => ['ongoing', 'finished'].includes(status))
        .withMessage('status must be either "ongoing" or "finished"'),
    validateRequest,
    fundraisingCampaignController.getFundraisingCampaigns
);

export default router;
