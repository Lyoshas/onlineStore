import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import FundraisingCampaignModel from '../models/fundraising-campaign.js';
import * as liqpayModel from '../models/liqpay.js';

export const getFundraisingCampaigns: RequestHandler<
    unknown,
    unknown,
    unknown,
    { status: 'ongoing' | 'finished' }
> = asyncHandler(async (req, res, next) => {
    const fundraisingCampaignModel = new FundraisingCampaignModel();

    res.json({
        fundraisingCampaigns:
            await fundraisingCampaignModel.getFundraisingCampaigns(
                req.query.status
            ),
    });
});

// creates a transaction with the 'is_paid' status set to 'false'
// returns "data" and "signature", which are used to redirect the
// user to the LiqPay payment page
export const createPendingTransaction: RequestHandler<
    unknown,
    unknown,
    { campaignId: number; donationAmount: number }
> = asyncHandler(async (req, res, next) => {
    const { campaignId, donationAmount } = req.body;
    const userId = req.user!.id;
    const fundraisingCampaignModel = new FundraisingCampaignModel();

    const transactionId =
        await fundraisingCampaignModel.createPendingTransaction({
            userId,
            campaignId,
            donationAmount,
        });

    const { data, signature } = liqpayModel.createLiqPayFormData({
        // using 'paydonate' is not an option here, because 'paydonate' allows users to enter any sum of money on the payment page
        action: 'pay',
        amount: donationAmount,
        description: `Пожертвування коштів на збір №${campaignId} користувачем з ID ${userId}`,
        orderId: transactionId,
        resultUrl: 'http://localhost/api/fundraising-campaign/callback',
    });

    res.status(201).json({ data, signature });
});
