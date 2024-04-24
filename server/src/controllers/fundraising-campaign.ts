import { RequestHandler } from 'express';
import * as fundraisingCampaignModel from '../models/fundraising-campaign.js';
import asyncHandler from 'express-async-handler';

export const getFundraisingCampaigns: RequestHandler<
    unknown,
    unknown,
    unknown,
    { status: 'ongoing' | 'finished' }
> = asyncHandler(async (req, res, next) => {
    res.json({
        fundraisingCampaigns:
            await fundraisingCampaignModel.getFundraisingCampaigns(
                req.query.status
            ),
    });
});
