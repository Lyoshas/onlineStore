import { FC, Fragment, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import Modal from '../UI/Modal/Modal';
import ButtonLink from '../UI/ButtonLink/ButtonLink';
import Loading from '../UI/Loading/Loading';
import classes from './CartContentsModal.module.css';
import { useGetCartQuery } from '../../store/apis/cartApi';
import CartProduct from '../CartProduct/CartProduct';
import CartLoadingOverlay from './CartLoadingOverlay/CartLoadingOverlay';
import Image from '../TopHeader/Image/Image';
import ErrorIcon from '../UI/Icons/ErrorIcon';
import { RootState } from '../../store';

interface CartContentsModalProps {
    onClose: () => void;
}

const CartContentsModal: FC<CartContentsModalProps> = (props) => {
    const {
        isFetching: isFetchingCart,
        isLoading: isFetchingCartFirstTime, // isLoading returns true when you're fetching data for the first time
        isSuccess: isGetCartSuccess,
        error: getCartError,
        data: cartData,
        requestId: currentGetCartRequestId,
    } = useGetCartQuery();
    // stores the initial request ID of the "get cart" operation
    const [initialGetCartRequestId, setInitialGetCartRequestId] = useState<
        string | null
    >(null);
    const isCartBeingChangedByAPI = useSelector(
        (state: RootState) => state.cartModal.isCartBeingChangedByAPI
    );

    useEffect(() => {
        // if no requests have been made, don't do anything
        if (!currentGetCartRequestId) return;

        setInitialGetCartRequestId((previousGetCartRequestId) => {
            return previousGetCartRequestId === null
                ? currentGetCartRequestId
                : previousGetCartRequestId;
        });
    }, [currentGetCartRequestId]);

    return (
        <Modal
            title="Your Cart"
            message={
                getCartError ? (
                    <div
                        className={
                            classes['cart-products__error-message-block']
                        }
                    >
                        <ErrorIcon className="icon" />
                        <p>Something went wrong while fetching the cart</p>
                    </div>
                ) : (
                    <Fragment>
                        <div
                            className={classNames(
                                classes['cart-products'],
                                cartData?.products.length === 0 &&
                                    classes['no-cart-products']
                            )}
                        >
                            {/* if the user is trying to add a product to the cart OR delete a product from the cart OR if the user is trying to fetch the cart and this is NOT the first time fetching the cart, then display <CartLoadingOverlay />*/}
                            {(isCartBeingChangedByAPI ||
                                (isFetchingCart &&
                                    initialGetCartRequestId &&
                                    currentGetCartRequestId !==
                                        initialGetCartRequestId)) && (
                                <CartLoadingOverlay />
                            )}
                            {/* if the cart is being fetched AND this is the first time fetching the cart, then display the <Loading /> component (NOT <CartLoadingOverlay />) */}
                            {isFetchingCartFirstTime && (
                                <Loading
                                    color="#273c99"
                                    className={classes['loader-margin']}
                                />
                            )}
                            {isGetCartSuccess && (
                                <Fragment>
                                    {cartData!.products.length === 0 && (
                                        <Fragment>
                                            <Image
                                                src="https://onlinestore-react-assets.s3.eu-north-1.amazonaws.com/empty-cart-icon.svg"
                                                alt="Empty cart"
                                                invertColor={false}
                                                className={
                                                    classes['empty-cart-icon']
                                                }
                                            />
                                            <p
                                                className={
                                                    classes[
                                                        'cart-products__no-items-paragraph'
                                                    ]
                                                }
                                            >
                                                You don't have any items in the
                                                cart
                                            </p>
                                        </Fragment>
                                    )}
                                    {cartData!.products.map((cartProduct) => {
                                        return (
                                            <CartProduct
                                                title={cartProduct.title}
                                                price={cartProduct.price}
                                                initialImageUrl={
                                                    cartProduct.initialImageUrl
                                                }
                                                quantity={cartProduct.quantity}
                                                productId={
                                                    cartProduct.productId
                                                }
                                                key={cartProduct.productId}
                                            />
                                        );
                                    })}
                                </Fragment>
                            )}
                        </div>
                        {isGetCartSuccess &&
                            cartData!.products.length !== 0 && (
                                <div className={classes['cart-summary']}>
                                    <h3
                                        className={
                                            classes[
                                                'cart-summary__total-price-header'
                                            ]
                                        }
                                    >
                                        Total Price
                                    </h3>
                                    <b
                                        className={
                                            classes[
                                                'cart-summary__total-price-value'
                                            ]
                                        }
                                    >
                                        {cartData!.totalPrice} ₴
                                    </b>
                                </div>
                            )}
                    </Fragment>
                )
            }
            actions={
                <ButtonLink
                    to="/user/cart/checkout"
                    className={classes['modal-actions__checkout-btn']}
                    onClick={props.onClose}
                >
                    Proceed to checkout
                </ButtonLink>
            }
            includeCancelButton={true}
            modalActionsClassName={classes['modal-actions-media-query']}
            onClose={props.onClose}
        />
    );
};

export default CartContentsModal;
