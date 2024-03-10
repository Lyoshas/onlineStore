import { FC } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';

import ICartProduct from '../../interfaces/CartProduct';
import classes from './CartProduct.module.css';
import AdditionalOptions from './AdditionalOptions/AdditionalOptions';
import { cartModalActions } from '../../store/slices/cartModal';
import CartProductQuantity from './CartProductQuantity/CartProductQuantity';
import formatCurrencyUAH from '../../util/formatCurrencyUAH';

const CartProduct: FC<ICartProduct> = (props) => {
    const dispatch = useDispatch();

    const handleLinkClick = () => {
        dispatch(cartModalActions.hideCartModal());
    };

    return (
        <div
            className={classNames(classes['cart-product'], classes['loading'])}
        >
            <div className={classes['cart-product-body']}>
                <Link
                    to={`/products/${props.productId}`}
                    className={classes['cart-product__img-block']}
                    onClick={handleLinkClick}
                >
                    <img
                        src={props.initialImageUrl}
                        className={classes['cart-product__img']}
                        alt="Cart product image"
                    />
                </Link>
                <Link
                    to={`/products/${props.productId}`}
                    className={classes['cart-product__title']}
                    onClick={handleLinkClick}
                >
                    {props.title}
                </Link>
                <AdditionalOptions productId={props.productId} />
            </div>
            <div className={classes['cart-product-footer']}>
                <CartProductQuantity
                    productId={props.productId}
                    productQuantity={props.quantity}
                />
                <p className={classes['cart-product-footer__price']}>
                    {formatCurrencyUAH(props.price)}
                </p>
            </div>
        </div>
    );
};

export default CartProduct;
