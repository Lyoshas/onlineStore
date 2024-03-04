import { Knex } from 'knex';

import knex from '../../services/knex.service.js';

const getUserRatingSubquery = (productId: number | Knex.Raw) => {
    return (
        knex
            // rounding to the nearest 0.5
            .select(
                knex.raw('(ROUND(AVG(star_rating) * 2) / 2)::DECIMAL(3, 2)')
            )
            .from('product_reviews')
            .innerJoin(
                'review_moderation_statuses',
                'review_moderation_statuses.id',
                '=',
                'product_reviews.moderation_status_id'
            )
            .where('product_id', '=', productId)
            .andWhere('review_moderation_statuses.name', '=', 'approved')
            .as('user_rating')
    );
};

export default getUserRatingSubquery;
