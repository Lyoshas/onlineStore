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
}

export default FundraisingCampaignModel;
