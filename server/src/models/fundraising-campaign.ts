import dbPool from '../services/postgres.service.js';
import camelCaseObject from '../util/camelCaseObject.js';
import formatSqlQuery from '../util/formatSqlQuery.js';

export const getFundraisingCampaigns = async (
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
> => {
    const { rows } = await dbPool.query<{
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
                +((+row.raised_money / row.financial_objective) * 100).toFixed(
                    2
                )
            ),
        };
    });
};
