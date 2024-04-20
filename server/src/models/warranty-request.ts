import dbPool from '../services/postgres.service.js';
import camelCaseObject from '../util/camelCaseObject.js';
import formatDate from '../util/formatDate.js';
import formatSqlQuery from '../util/formatSqlQuery.js';

export const getWarrantyRequestsByUserId = async (
    userId: number
): Promise<
    {
        id: number;
        issueDescription: string;
        serviceCenter: string;
        userDataRequestInitiator: {
            firstName: string;
            lastName: string;
            email: string;
        };
        repairingProductData: {
            title: string;
            previewURL: string;
        };
        statusHistory: {
            statusChangeTime: string;
            status: string;
        }[];
    }[]
> => {
    const { rows } = await dbPool.query<{
        warranty_request_id: number;
        issue_description: string;
        user_first_name: string;
        user_last_name: string;
        user_email: string;
        product_title: string;
        product_preview_url: string;
        service_center: string;
        status_history: {
            status_name: string;
            status_change_time: string;
        }[];
    }>(
        formatSqlQuery(`
            SELECT
                wr.id AS warranty_request_id,
                issue_description,
                u.first_name AS user_first_name,
                u.last_name AS user_last_name,
                u.email AS user_email,
                p.title AS product_title,
                p.initial_image_url AS product_preview_url,
                CONCAT(
                    'Сервісний центр №',
                    sc.id,
                    ' (вул. ',
                    a.street_name,
                    ', ',
                    a.building_number,
                    ', ',
                    c.name,
                    ', ',
                    a.postal_code,
                    ')'
                ) AS service_center,
                (
                    SELECT json_agg(t)
                    FROM (
                        SELECT
                            wrs.name AS status_name,
                            wrsh.change_time AS status_change_time
                        FROM warranty_request_status_history AS wrsh
                        INNER JOIN warranty_request_statuses AS wrs
                            ON wrs.id = wrsh.status_id
                        WHERE warranty_request_id = wr.id
                        ORDER BY wrsh.change_time DESC
                    ) AS t
                ) AS status_history
            FROM warranty_requests AS wr
            INNER JOIN users AS u ON u.id = wr.user_id
            INNER JOIN service_centers AS sc ON sc.id = wr.service_center_id
            INNER JOIN products AS p ON p.id = wr.product_id
            INNER JOIN addresses AS a ON a.id = sc.address_id
            INNER JOIN cities AS c ON c.id = a.city_id
            WHERE wr.user_id = $1
            ORDER BY wr.id DESC;
        `),
        [userId]
    );

    return rows.map((row) => {
        const request = camelCaseObject(row);

        return {
            id: request.warrantyRequestId,
            issueDescription: request.issueDescription,
            serviceCenter: request.serviceCenter,
            userDataRequestInitiator: {
                firstName: request.userFirstName,
                lastName: request.userLastName,
                email: request.userEmail,
            },
            repairingProductData: {
                title: request.productTitle,
                previewURL: request.productPreviewUrl,
            },
            statusHistory: request.statusHistory.map((statusEntry) => ({
                statusChangeTime: formatDate(
                    new Date(statusEntry.statusChangeTime),
                    'dd.mm.yyyy hh:mm'
                ),
                status: statusEntry.statusName,
            })),
        };
    });
};
