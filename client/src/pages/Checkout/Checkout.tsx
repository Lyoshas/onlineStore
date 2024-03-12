import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import { Fragment, useCallback, useEffect } from 'react';

import { RootState } from '../../store';
import OrderRecipient from './OrderRecipient/OrderRecipient';
import DeliveryMethods from './DeliveryMethods/DeliveryMethods';
import SchemaContext from '../../context/validationSchema';
import PaymentMethods from './PaymentMethods/PaymentMethods';
import CheckoutInitialValues from './interfaces/CheckoutInitialValues';
import OrderProductList from './OrderProductList/OrderProductList';
import OrderSummary from './OrderSummary/OrderSummary';
import Button from '../../components/UI/Button/Button';
import { cartModalActions } from '../../store/slices/cartModal';
import checkoutSchemaWithAuth from './schema/checkoutSchemaWithAuth';
import checkoutSchemaNoAuth from './schema/checkoutSchemaNoAuth';
import LoadingScreen from '../../components/UI/LoadingScreen/LoadingScreen';
import {
    OrderCreationInputAuth,
    OrderCreationInputNoAuth,
    useCreateOrderMutation,
} from '../../store/apis/orderApi';
import useApiError from '../../components/hooks/useApiError';
import ErrorMessageBlock from '../../components/UI/ErrorMessageBlock/ErrorMessageBlock';
import Layout from '../../components/Layout/Layout';
import classes from './Checkout.module.css';
import SuccessMessage from './SuccessMessage/SuccessMessage';
import RedirectToLiqpay from './RedirectToLiqpay/RedirectToLiqpay';
import { localCartActions } from '../../store/slices/localCart';

const initialValues: CheckoutInitialValues = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    city: '',
    paymentMethod: '',
    deliveryMethod: {
        postalService: '',
        office: '',
    },
    orderProducts: [],
};

const Checkout = () => {
    const dispatch = useDispatch();
    const [
        createOrder,
        {
            isLoading: isCreatingOrder,
            isError: isOrderCreationError,
            error: orderCreationError,
            data: orderCreationData,
            isSuccess: isOrderCreationSuccess,
            isUninitialized,
        },
    ] = useCreateOrderMutation();
    useApiError(isOrderCreationError, orderCreationError, []);
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    // if the user is authenticated, their local cart is synchronized with the API
    const cartProducts = useSelector(
        (state: RootState) => state.localCart.products
    );

    useEffect(() => {
        if (!isOrderCreationSuccess) return;
        // if the API call was successful, clean the cart
        dispatch(localCartActions.emptyCart());
    }, [isOrderCreationSuccess]);

    useEffect(() => {
        if (!orderCreationData || isAuthenticated === null) return;
        // if the payment method is 'Pay now' and the user is anonymous, save a parameter in localStorage
        if ('data' in orderCreationData && !isAuthenticated) {
            // specify that we're trying to create an order without authentication
            localStorage.setItem('orderWithNoAuth', 'true');
        }
    }, [orderCreationData, isAuthenticated]);

    const changeOrderButtonClickHandler = useCallback(() => {
        dispatch(cartModalActions.showCartModal());
    }, [dispatch]);

    if (isAuthenticated === null) {
        return <LoadingScreen />;
    }

    const checkoutSchema = isAuthenticated
        ? checkoutSchemaWithAuth
        : checkoutSchemaNoAuth;

    return (
        <Fragment>
            {/* if an order is being created or if the payment method is 'Pay Now', display a loading screen */}
            {(isCreatingOrder ||
                (orderCreationData && 'data' in orderCreationData)) && (
                <LoadingScreen />
            )}
            {/* if the payment method is 'Payment upon delivery', show the success message, otherwise redirect to the Liqpay payment page */}
            {!!orderCreationData ? (
                'orderId' in orderCreationData ? (
                    <SuccessMessage
                        showEmailNotice={!isAuthenticated}
                        mode="OrderCreated"
                    />
                ) : (
                    <RedirectToLiqpay
                        data={orderCreationData.data}
                        signature={orderCreationData.signature}
                    />
                )
            ) : null}
            {isOrderCreationError && (
                <ErrorMessageBlock message="Something went wrong while creating the order. Please try again." />
            )}
            {isUninitialized && (
                <Layout>
                    <Formik
                        initialValues={
                            isAuthenticated
                                ? initialValues
                                : // 'email' is only for anonymous users
                                  { ...initialValues, email: '' }
                        }
                        validateOnBlur={false}
                        validateOnChange={false}
                        validateOnMount={true}
                        validationSchema={checkoutSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            const sharedData = {
                                firstName: values.firstName,
                                lastName: values.lastName,
                                phoneNumber: values.phoneNumber,
                                paymentMethod:
                                    values.paymentMethod === 'Pay now'
                                        ? 'Оплатити зараз'
                                        : 'Оплата при отриманні товару',
                                city: values.city,
                                deliveryWarehouse: values.deliveryMethod.office,
                            };
                            // this parameter specifies that the user is trying to create an order with no authentication
                            // we're removing it because in case it was set before, because we will set it again in the future
                            localStorage.removeItem('orderWithNoAuth');
                            createOrder(
                                isAuthenticated
                                    ? (sharedData as OrderCreationInputAuth)
                                    : ({
                                          ...sharedData,
                                          email: values.email,
                                          orderProducts: Object.values(
                                              cartProducts
                                          ).map((product) => ({
                                              productId: product!.productId,
                                              quantity: product!.quantity,
                                          })),
                                      } as OrderCreationInputNoAuth)
                            );
                        }}
                    >
                        {(formik) => {
                            return (
                                <SchemaContext.Provider value={checkoutSchema}>
                                    <div className={classes['checkout-intro']}>
                                        <h1
                                            className={
                                                classes[
                                                    'checkout-intro__heading'
                                                ]
                                            }
                                        >
                                            Checkout
                                        </h1>
                                        <Button
                                            onClick={
                                                changeOrderButtonClickHandler
                                            }
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                    <div className={classes['checkout']}>
                                        <div
                                            className={classes['order-details']}
                                        >
                                            <OrderProductList />
                                            <OrderRecipient />
                                            <DeliveryMethods />
                                            <PaymentMethods />
                                        </div>
                                        <OrderSummary
                                            divClassName={
                                                classes['order-summary-adjust']
                                            }
                                        />
                                    </div>
                                </SchemaContext.Provider>
                            );
                        }}
                    </Formik>
                </Layout>
            )}
        </Fragment>
    );
};

export default Checkout;
