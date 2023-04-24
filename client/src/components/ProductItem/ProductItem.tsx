import { FC, useState } from 'react';

import classes from './ProductItem.module.css';
import { Link } from 'react-router-dom';
import Button from '../UI/Button/Button';
import classNames from 'classnames';

interface ProductItemProps {
    id: number;
    title: string;
    // the user will see this image first
    initialImageURL: string;
    // when the user hovers over the image, it will change to "additionalImageURL"
    additionalImageURL: string;
    price: number;
    shortDescription: string;
    isAvailable: boolean;
    isRunningOut: boolean;
}

const ProductItem: FC<ProductItemProps> = (props) => {
    const [showMainImage, setShowMainImage] = useState<boolean>(true);

    const handleMouseEnter = () => setShowMainImage(false);
    const handleMouseLeave = () => setShowMainImage(true);

    return (
        <article
            className={classNames(
                classes['product-list__item'],
                !props.isAvailable && classes['not-available'],
                props.isAvailable &&
                    props.isRunningOut &&
                    classes['running-out']
            )}
        >
            <Link
                to={`/products/${props.id}`}
                className={classes['product-item__img-block']}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    className={classNames(
                        classes['product-item__img'],
                        showMainImage ? '' : classes.hidden
                    )}
                    src={props.initialImageURL}
                    alt={props.title}
                />
                <img
                    className={classNames(
                        classes['product-item__img'],
                        showMainImage ? classes.hidden : ''
                    )}
                    src={props.additionalImageURL}
                    alt={props.title}
                />
            </Link>
            <div className={classes['product-item__info-block']}>
                <Link
                    to={`/products/${props.id}`}
                    className={classes['product-item__heading']}
                    title={props.title}
                >
                    {props.title}
                </Link>
                <p className={classes['product-item__price']}>
                    {props.price} ₴
                </p>
                <Button className={classes['product-item__cart-btn']}>
                    <img
                        className={classes['cart-btn__icon']}
                        src="/cart-icon.svg"
                        alt="Cart"
                    />
                </Button>
            </div>
            {props.isAvailable && (
                <div className={classes['product-item__description']}>
                    <span>{props.shortDescription}</span>
                </div>
            )}
        </article>
    );
};

export default ProductItem;
