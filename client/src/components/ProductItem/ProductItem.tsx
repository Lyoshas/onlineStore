import { FC, Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import classes from './ProductItem.module.css';
import { RootState } from '../../store';
import ButtonLink from '../UI/ButtonLink/ButtonLink';
import DeleteButton from './DeleteButton/DeleteButton';
import AddToCartButton from '../AddToCartButton/AddToCartButton';
import StarRating from '../UI/StarRating/StarRating';
import formatCurrencyUAH from '../../util/formatCurrencyUAH';

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
    isInTheCart: boolean;
    userRating?: number | null;
}

const ProductItem: FC<ProductItemProps> = (props) => {
    const [showMainImage, setShowMainImage] = useState<boolean>(true);
    const isAdmin = useSelector((state: RootState) => state.auth.isAdmin);
    const isLessThan250px = useMediaQuery({ query: '(max-width: 250px)' });

    const handleMouseEnter = () => setShowMainImage(false);
    const handleMouseLeave = () => setShowMainImage(true);

    return (
        <article
            className={classNames(
                classes['product-list__item'],
                props.userRating !== undefined && classes['extended-height'],
                isAdmin && classes.admin,
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
                {props.userRating !== null &&
                    props.userRating !== undefined && (
                        <div className={classes['product-item__user-rating']}>
                            <StarRating
                                value={props.userRating}
                                readOnly
                                starSize={isLessThan250px ? '1.2rem' : ''}
                            />
                        </div>
                    )}
                <p className={classes['product-item__price']}>
                    {formatCurrencyUAH(props.price)}
                </p>
                <div
                    className={classNames(
                        classes['product-item__actions'],
                        isAdmin && classes['keep-separate']
                    )}
                >
                    {props.isAvailable && (
                        <AddToCartButton
                            productId={props.id}
                            title={props.title}
                            price={props.price}
                            initialImageUrl={props.initialImageURL}
                            isInTheCart={props.isInTheCart}
                        />
                    )}
                    {isAdmin && (
                        <Fragment>
                            <ButtonLink
                                to={`/edit-product/${props.id}`}
                                className={classes['product-item__edit-btn']}
                            >
                                Edit
                            </ButtonLink>
                            <DeleteButton
                                className={classes['product-item__delete-btn']}
                                productId={props.id}
                                productTitle={props.title}
                            />
                        </Fragment>
                    )}
                </div>
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
