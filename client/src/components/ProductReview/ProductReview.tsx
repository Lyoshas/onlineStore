import { FC } from 'react';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

import classes from './ProductReview.module.css';

const CustomIcon = <StarIcon style={{ color: 'white' }} />;

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
            <Rating
                value={props.starRating}
                precision={0.5}
                emptyIcon={CustomIcon}
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
