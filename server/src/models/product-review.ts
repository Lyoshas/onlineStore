import dbPool from '../services/postgres.service.js';
import formatSqlQuery from '../util/formatSqlQuery.js';

export const addProductReview = (
    productId: number,
    userId: number,
    reviewMessage: string,
    starRating: number
) => {
    return dbPool.query(
        formatSqlQuery(`
            INSERT INTO product_reviews (
                product_id,
                user_id,
                review_message,
                star_rating,
                moderation_status_id
            ) VALUES (
                $1,
                $2,
                $3,
                $4,
                (SELECT id
                    FROM moderation_statuses
                    WHERE name = 'pending')
            )
        `),
        [productId, userId, reviewMessage, starRating]
    );
};

export const productReviewExists = async (
    productId: number,
    userId: number
): Promise<boolean> => {
    const { rowCount } = await dbPool.query(
        'SELECT 1 FROM product_reviews WHERE product_id = $1 AND user_id = $2',
        [productId, userId]
    );

    return rowCount > 0;
};
