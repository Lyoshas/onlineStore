import { FC } from 'react';
import classNames from 'classnames';

import classes from './ProductDescription.module.css';
import AddToCartButton from '../../../components/AddToCartButton/AddToCartButton';
import StarRating from '../../../components/UI/StarRating/StarRating';
import formatCurrencyUAH from '../../../store/util/formatCurrencyUAH';

interface ProductDescriptionProps {
    productId: number;
    title: string;
    price: number;
    initialImageUrl: string;
    shortDescription: string;
    isProductAvailable: boolean;
    isProductRunningOut: boolean;
    isInTheCart: boolean;
    userRating: number | null;
}

const ProductDescription: FC<ProductDescriptionProps> = ({
    productId,
    title,
    price,
    shortDescription,
    isProductAvailable,
    isProductRunningOut,
    isInTheCart,
    initialImageUrl,
    userRating,
}) => {
    return (
        <section className={classes['product-info__description']}>
            <h2 className={classes['product-description__title']}>{title}</h2>
            {userRating !== null && (
                <div className={classes['product-description__user-rating']}>
                    <StarRating value={userRating} readOnly />
                </div>
            )}
            <span
                className={classNames(
                    classes['product-description__price'],
                    !isProductAvailable && classes['not-available']
                )}
            >
                {formatCurrencyUAH(price)}
            </span>
            {(!isProductAvailable || isProductRunningOut) && (
                <span
                    className={
                        classes['product-description__availability-notice']
                    }
                >
                    {!isProductAvailable
                        ? 'The product has run out'
                        : 'The product is running out'}
                </span>
            )}
            <p className={classes['product-description__short-description']}>
                {shortDescription}
            </p>
            {isProductAvailable && (
                <AddToCartButton
                    productId={productId}
                    title={title}
                    price={price}
                    initialImageUrl={initialImageUrl}
                    isInTheCart={isInTheCart}
                    addLabels={true}
                    className={classes['product-description__add-to-cart-btn']}
                />
            )}
        </section>
    );
};

export default ProductDescription;
