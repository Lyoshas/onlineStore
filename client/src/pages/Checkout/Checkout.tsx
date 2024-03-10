import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../../components/Layout/Layout';
import classes from './Checkout.module.css';
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
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    // if the user is authenticated, their local cart is synchronized with the API
    const cartProducts = useSelector(
        (state: RootState) => state.localCart.products
    );

    useEffect(() => {
        // if there are no items to order, redirect to the main page
        if (Object.values(cartProducts).length === 0) {
            navigate('/');
        }
    }, [cartProducts]);

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
                    console.log('submitting');
                }}
            >
                {(formik) => {
                    return (
                        <SchemaContext.Provider value={checkoutSchema}>
                            <div className={classes['checkout-intro']}>
                                <h1
                                    className={
                                        classes['checkout-intro__heading']
                                    }
                                >
                                    Checkout
                                </h1>
                                <Button onClick={changeOrderButtonClickHandler}>
                                    Edit
                                </Button>
                            </div>
                            <div className={classes['checkout']}>
                                <div className={classes['order-details']}>
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
    );
};

export default Checkout;
