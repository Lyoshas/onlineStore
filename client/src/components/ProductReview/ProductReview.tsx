import { FC } from 'react';

import classes from './ProductReview.module.css';
import StarRating from '../UI/StarRating/StarRating';

const ProductReview: FC<{
    userId: number;
    fullName: string;
    reviewMessage: string;
    starRating: number;
    createdAt: string; // "DD.MM.YYYY"
}> = (props) => {
    return (
        <article className={classes['product-review']}>
            <div className={classes['product-review__head']}>
                <h4 className={classes['product-review__username']}>
                    {props.fullName}
                </h4>
                <span>{props.createdAt}</span>
            </div>
            <StarRating
                value={props.starRating}
                className={classes['product-review__star-rating']}
                readOnly
            />
            <p className={classes['product-review__text']}>
                {props.reviewMessage}
            </p>
        </article>
    );
};

export default ProductReview;
