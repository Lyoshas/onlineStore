import { FC } from 'react';
import { Link } from 'react-router-dom';

import classes from './OrderProduct.module.css';
import formatCurrencyUAH from '../../util/formatCurrencyUAH';

interface OrderProductProps {
    previewURL: string;
    title: string;
    quantity: number;
    price: number;
    productId: number;
}

const OrderProduct: FC<OrderProductProps> = (props) => {
    return (
        <div className={classes['order-product']}>
            <div className={classes['order-product__image-and-title']}>
                <div className={classes['order-product__preview-img-block']}>
                    <Link
                        to={`/products/${props.productId}`}
                        className={classes['order-product__link']}
                    >
                        <img
                            src={props.previewURL}
                            alt={props.title}
                            className={classes['order-product__preview-img']}
                        />
                    </Link>
                </div>
                <div className={classes['order-product__title-block']}>
                    <Link
                        to={`/products/${props.productId}`}
                        className={classes['order-product__link']}
                    >
                        <span className={classes['order-product__title']}>
                            {props.title}
                        </span>
                    </Link>
                </div>
            </div>
            <div className={classes['order-product__quantity-and-price']}>
                <div className={classes['order-product__quantity']}>
                    <span className={classes['order-product__quantity-value']}>
                        {props.quantity} item{props.quantity > 1 ? 's' : ''}
                    </span>
                </div>
                <div className={classes['order-product__price']}>
                    <b className={classes['order-product__price-value']}>
                        {formatCurrencyUAH(props.quantity * props.price)}
                    </b>
                </div>
            </div>
        </div>
    );
};

export default OrderProduct;
