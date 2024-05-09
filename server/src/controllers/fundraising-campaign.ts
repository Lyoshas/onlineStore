import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import FundraisingCampaignModel from '../models/fundraising-campaign.js';
import * as liqpayModel from '../models/liqpay.js';
import * as transactionModel from '../models/pg-transaction.js';
import { base64Encode } from '../util/base64.js';
import CamelCaseProperties from '../interfaces/CamelCaseProperties.js';
import LiqpayDecodedData from '../interfaces/LiqpayDecodedData.js';
import dbPool from '../services/postgres.service.js';
import FundraisingCampaignFinishedError from '../errors/FundraisingCampaignFinishedError.js';

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

    if (await fundraisingCampaignModel.isCampaignFinished({ campaignId })) {
        throw new FundraisingCampaignFinishedError();
    }

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

export const donationCallback: RequestHandler<
    unknown,
    unknown,
    { data: CamelCaseProperties<LiqpayDecodedData>; signature: string }
> = asyncHandler(async (req, res, next) => {
    // if we make it here, it means the "signature" is valid for the provided "data" parameter
    // we validated the signature using 'express-validator' (see routes/order.ts)
    const redirectToClient = (
        status: 'success' | 'failure' | 'cancel' | 'already paid'
    ) => {
        const response = { status };
        res.redirect(
            `${
                process.env.REACT_APP_URL
            }/fundraising-campaign/callback?res=${base64Encode(
                JSON.stringify(response)
            )}`
        );
    };

    const paymentInfo = req.body.data;
    const transactionId = paymentInfo.orderId;

    // if the transaction was cancelled, redirect to the appropriate page
    if (paymentInfo.errCode === 'cancel') {
        return redirectToClient('cancel');
    }

    const dbClient = await dbPool.connect();
    // creating a SQL transaction
    await transactionModel.beginTransaction(dbClient);
    const fundraisingCampaignModel = new FundraisingCampaignModel(dbClient);

    try {
        // the operations below are related to fundraising transactions, not SQL transactions
        if (
            !(await fundraisingCampaignModel.transactionExists(
                transactionId
            )) ||
            paymentInfo.action !== 'pay' ||
            paymentInfo.status !== 'success'
        ) {
            return redirectToClient('failure');
        } else if (
            await fundraisingCampaignModel.isTransactionPaidFor(transactionId)
        ) {
            return redirectToClient('already paid');
        }

        await fundraisingCampaignModel.markTransactionAsPaid(transactionId);
        // Every fundraising campaign holds a field called "is_finished" inside the DB.
        // It was decided to create this field because calculating it for every
        // requested fundraising campaign is too expensive in terms of computing power.
        // In introduces data redundancy, but it's worth the overhead
        if (
            await fundraisingCampaignModel.isCampaignFinished({ transactionId })
        ) {
            await fundraisingCampaignModel.markCampaignAsFinished(
                transactionId
            );
        }

        await transactionModel.commitTransaction(dbClient);

        return redirectToClient('success');
    } catch {
        await transactionModel.rollbackTransaction(dbClient);
    } finally {
        dbClient.release();
    }
});
