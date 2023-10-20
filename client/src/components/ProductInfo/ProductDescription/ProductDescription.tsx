import { FC } from 'react';
import classNames from 'classnames';

import classes from './ProductDescription.module.css';

interface ProductDescriptionProps {
    title: string;
    price: number;
    shortDescription: string;
    isProductAvailable: boolean;
    isProductRunningOut: boolean;
}

const ProductDescription: FC<ProductDescriptionProps> = ({
    title,
    price,
    shortDescription,
    isProductAvailable,
    isProductRunningOut,
}) => {
    return (
        <section className={classes['product-info__description']}>
            <h2 className={classes['product-description__title']}>{title}</h2>
            <span
                className={classNames(
                    classes['product-description__price'],
                    !isProductAvailable && classes['not-available']
                )}
            >
                ₴ {price}
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
        </section>
    );
};

export default ProductDescription;
