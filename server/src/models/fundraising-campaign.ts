import { Pool, PoolClient } from 'pg';

import dbPool from '../services/postgres.service.js';
import camelCaseObject from '../util/camelCaseObject.js';
import formatSqlQuery from '../util/formatSqlQuery.js';

class FundraisingCampaignModel {
    private dbClient: PoolClient | Pool;

    constructor(dbClient?: PoolClient) {
        this.dbClient = dbClient || dbPool;
    }

    public async getFundraisingCampaigns(
        status: 'ongoing' | 'finished'
    ): Promise<
        {
            id: number;
            title: string;
            financialObjective: number;
            previewUrl: string;
            raisedMoney: number;
            fundingProgressPercentage: number;
        }[]
    > {
        const { rows } = await this.dbClient.query<{
            id: number;
            title: string;
            financial_objective: number;
            preview_url: string;
            raised_money: string;
        }>(
            formatSqlQuery(`
                SELECT
                    id,
                    title,
                    financial_objective,
                    preview_url,
                    (
                        SELECT SUM(donation_amount)
                        FROM fundraising_transactions
                        WHERE
                            is_paid = true AND
                            campaign_id = fundraising_campaigns.id
                    ) AS raised_money
                FROM fundraising_campaigns
                WHERE is_finished = $1;
            `),
            [status === 'finished']
        );

        return rows.map((row) => {
            return {
                ...camelCaseObject(row),
                raisedMoney: +row.raised_money,
                fundingProgressPercentage: Math.min(
                    100,
                    +(
                        (+row.raised_money / row.financial_objective) *
                        100
                    ).toFixed(2)
                ),
            };
        });
    }

    // creates a transaction with 'is_paid' = false
    public async createPendingTransaction(transactionInfo: {
        userId: number;
        campaignId: number;
        donationAmount: number;
    }): Promise<number> {
        const { userId, campaignId, donationAmount } = transactionInfo;

        const { rows } = await this.dbClient.query<{ id: number }>(
            formatSqlQuery(
                `
                    INSERT INTO fundraising_transactions (
                        user_id,
                        campaign_id,
                        donation_amount,
                        is_paid
                    ) VALUES ($1, $2, $3, false)
                    RETURNING id;
                `
            ),
            [userId, campaignId, donationAmount]
        );

        return rows[0].id;
    }

    public async fundraisingCampaignExists(
        campaignId: number
    ): Promise<boolean> {
        const { rows } = await this.dbClient.query<{
            campaign_exists: boolean;
        }>(
            `
                SELECT EXISTS(
                    SELECT 1 FROM fundraising_campaigns WHERE id = $1
                ) AS campaign_exists;
            `,
            [campaignId]
        );

        return rows[0].campaign_exists;
    }

    public async transactionExists(transactionId: number): Promise<boolean> {
        const { rows } = await this.dbClient.query<{ exists: boolean }>(
            `
                SELECT EXISTS(
                    SELECT 1
                    FROM fundraising_transactions
                    WHERE id = $1
                )
            `,
            [transactionId]
        );

        return rows[0].exists;
    }

    public async isTransactionPaidFor(transactionId: number): Promise<boolean> {
        const { rows } = await this.dbClient.query<{ is_paid: boolean }>(
            'SELECT is_paid FROM fundraising_transactions WHERE id = $1',
            [transactionId]
        );

        return camelCaseObject(rows[0]).isPaid;
    }

    public async markTransactionAsPaid(transactionId: number): Promise<void> {
        await this.dbClient.query(
            'UPDATE fundraising_transactions SET is_paid = true WHERE id = $1',
            [transactionId]
        );
    }

    // transactionId will be used to deduce the fundraising campaign ID
    public async markCampaignAsFinished(transactionId: number): Promise<void> {
        await this.dbClient.query(
            `
                UPDATE fundraising_campaigns AS fc
                SET is_finished = true
                FROM fundraising_transactions AS ft
                WHERE fc.id = ft.campaign_id AND ft.id = $1;
            `,
            [transactionId]
        );
    }

    // this function calculates whether the campaign raised all the necessary money
    // the fundraising campaign is specified using either its ID or a transaction ID
    // that is related to this fundraising campaign
    public async isCampaignFinished({
        transactionId,
    }: {
        transactionId: number;
    }): Promise<boolean>;
    public async isCampaignFinished({
        campaignId,
    }: {
        campaignId: number;
    }): Promise<boolean>;
    public async isCampaignFinished({
        transactionId,
        campaignId,
    }: {
        transactionId?: number;
        campaignId?: number;
    }): Promise<boolean> {
        const queryWithTransactionId = `
            SELECT (
                (
                    SELECT SUM(donation_amount)
                    FROM fundraising_transactions AS ft
                    WHERE ft.campaign_id = fc.id AND ft.is_paid = true
                ) / fc.financial_objective * 100 >= 100
            ) AS is_finished
            FROM fundraising_campaigns AS fc
            WHERE id = (
                SELECT campaign_id
                FROM fundraising_transactions
                WHERE id = $1
            );
        `;
        const queryWithCampaignId = `
            SELECT (
                (
                    SELECT SUM(donation_amount)
                    FROM fundraising_transactions AS ft
                    WHERE campaign_id = $1 AND is_paid = true
                ) /
                (
                    SELECT financial_objective
                    FROM fundraising_campaigns
                    WHERE id = $1
                )
                * 100 >= 100
            ) AS is_finished;
        `;

        const useTransactionIdQuery: boolean =
            typeof transactionId === 'number';
        const { rows } = await this.dbClient.query<{ is_finished: boolean }>(
            useTransactionIdQuery
                ? queryWithTransactionId
                : queryWithCampaignId,
            [useTransactionIdQuery ? transactionId : campaignId]
        );

        return camelCaseObject(rows[0]).isFinished;
    }
}

export default FundraisingCampaignModel;
