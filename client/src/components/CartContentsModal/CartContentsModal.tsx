import { FC, Fragment, useEffect } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';

import Modal from '../UI/Modal/Modal';
import ButtonLink from '../UI/ButtonLink/ButtonLink';
import Loading from '../UI/Loading/Loading';
import classes from './CartContentsModal.module.css';
import { useLazyGetCartQuery } from '../../store/apis/cartApi';
import CartProduct from '../CartProduct/CartProduct';
import CartLoadingOverlay from './CartLoadingOverlay/CartLoadingOverlay';
import Image from '../TopHeader/Image/Image';
import ErrorIcon from '../UI/Icons/ErrorIcon';
import { RootState } from '../../store';
import ICartProduct from '../../interfaces/CartProduct';
import { useLazyCheckOrderFeasibilityQuery } from '../../store/apis/orderCheckApi';
import useApiError from '../hooks/useApiError';
import calculateCartTotalPrice from '../../store/util/calculateCartTotalPrice';
import { localCartActions } from '../../store/slices/localCart';

const displayCartProducts = (cartProduct: ICartProduct) => {
    return (
        <CartProduct
            title={cartProduct.title}
            price={cartProduct.price}
            initialImageUrl={cartProduct.initialImageUrl}
            quantity={cartProduct.quantity}
            productId={cartProduct.productId}
            canBeOrdered={cartProduct.canBeOrdered}
            key={cartProduct.productId}
        />
    );
};

interface CartContentsModalProps {
    onClose: () => void;
}

const CartContentsModal: FC<CartContentsModalProps> = (props) => {
    const dispatch = useDispatch();
    const [
        getCartViaAPI,
        {
            isFetching: isFetchingCartViaAPI,
            isLoading: isFetchingCartFirstTimeViaAPI, // isLoading returns true when you're fetching data for the first time
            error: getCartErrorViaAPI,
            data: cartDataViaAPI,
        },
    ] = useLazyGetCartQuery();
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const isCartBeingChangedByAPI = useSelector(
        (state: RootState) => state.cartModal.isCartBeingChangedByAPI
    );
    const localCartData = useSelector((state: RootState) => state.localCart);
    const [
        checkOrderFeasibility,
        {
            isFetching: isCheckingOrderFeasbility,
            isError: isOrderFeasibilityCheckError,
            error: orderFeasibilityCheckError,
            data: orderFeasibilityCheckData,
        },
    ] = useLazyCheckOrderFeasibilityQuery();
    useApiError(isOrderFeasibilityCheckError, orderFeasibilityCheckError, []);

    useEffect(() => {
        // 'isAuthenticated' can be null
        if (
            isAuthenticated === false &&
            Object.values(localCartData.products).length > 0
        ) {
            checkOrderFeasibility(
                Object.values(localCartData.products).map((product) => ({
                    productId: product!.productId,
                    quantity: product!.quantity,
                }))
            );
        }
    }, [isAuthenticated, checkOrderFeasibility, localCartData]);

    useEffect(() => {
        if (isAuthenticated) getCartViaAPI();
    }, [isAuthenticated]);

    useEffect(() => {
        if (orderFeasibilityCheckData) {
            dispatch(
                localCartActions.updateCartProductsAvailability(
                    orderFeasibilityCheckData
                )
            );
        }
    }, [orderFeasibilityCheckData]);

    let cartData: { products: ICartProduct[]; totalPrice: number } | undefined;
    switch (isAuthenticated) {
        // if the auth status of the user hasn't been determined yet, the value will be "undefined"
        case null:
            cartData = undefined;
            break;
        // if the user is authenticated, use cart products fetched from the API
        case true:
            cartData = cartDataViaAPI;
            break;
        // if the user is NOT authenticated, use cart products stored locally
        default:
            const productList = Object.values(
                localCartData.products
            ) as ICartProduct[];
            cartData = {
                products: productList,
                totalPrice: calculateCartTotalPrice(localCartData.products),
            };
            break;
    }

    let cart: {
        basicProducts: ICartProduct[];
        unavailableProducts: ICartProduct[];
    } | null = cartData
        ? {
              basicProducts: [],
              unavailableProducts: [],
          }
        : null;

    cartData?.products.forEach((cartProduct) => {
        if (!cartProduct.canBeOrdered) {
            cart!.unavailableProducts.push(cartProduct);
        } else {
            cart!.basicProducts.push(cartProduct);
        }
    });

    return (
        <Modal
            title="Your Cart"
            message={
                getCartErrorViaAPI ? (
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
                            {isCartBeingChangedByAPI ||
                            (isFetchingCartViaAPI &&
                                !isFetchingCartFirstTimeViaAPI) ||
                            isCheckingOrderFeasbility ? (
                                <CartLoadingOverlay />
                            ) : null}
                            {/* if the cart is being fetched for the first time, display the <Loading /> component (NOT <CartLoadingOverlay />) */}
                            {isFetchingCartFirstTimeViaAPI && (
                                <Loading
                                    color="#273c99"
                                    className={classes['loader-margin']}
                                />
                            )}
                            <Fragment>
                                {cartData && cartData.products.length === 0 && (
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
                                            You don't have any items in the cart
                                        </p>
                                    </Fragment>
                                )}
                                {cart !== null && (
                                    <Fragment>
                                        {cart.basicProducts.length > 0 && (
                                            <div
                                                className={
                                                    classes[
                                                        'cart-products__basic-items'
                                                    ]
                                                }
                                            >
                                                {cart.basicProducts.map(
                                                    displayCartProducts
                                                )}
                                            </div>
                                        )}
                                        {cart.unavailableProducts.length >
                                            0 && (
                                            <div
                                                className={
                                                    classes[
                                                        'cart-products__unavailable-items'
                                                    ]
                                                }
                                            >
                                                <h3
                                                    className={
                                                        classes[
                                                            'unavailable-products__heading'
                                                        ]
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            classes[
                                                                'cart-products__heading-text-wrapper'
                                                            ]
                                                        }
                                                    >
                                                        Unavailable products
                                                    </span>
                                                </h3>
                                                {cart.unavailableProducts.map(
                                                    displayCartProducts
                                                )}
                                            </div>
                                        )}
                                    </Fragment>
                                )}
                            </Fragment>
                        </div>
                        {cartData && cartData.products.length !== 0 && (
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
