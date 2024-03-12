import { useField } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import classes from './OrderProductList.module.css';
import OrderProduct from '../../../components/OrderProduct/OrderProduct';
import { RootState } from '../../../store';
import CheckoutInitialValues from '../interfaces/CheckoutInitialValues';
import { useLazyCheckOrderFeasibilityQuery } from '../../../store/apis/orderCheckApi';
import { localCartActions } from '../../../store/slices/localCart';
import useApiError from '../../../components/hooks/useApiError';
import LoadingScreen from '../../../components/UI/LoadingScreen/LoadingScreen';
import getEligibleCartProducts from '../../../util/getEligibleCartProducts';

const OrderProductList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [meta, field, helpers] =
        useField<CheckoutInitialValues['orderProducts']>('orderProducts');
    const cartProducts = useSelector(
        (state: RootState) => state.localCart.products
    );
    const [
        checkOrderFeasibility,
        {
            isFetching: isCheckingOrderFeasbility,
            data: orderFeasibilityCheckData,
            isError: isOrderFeasibilityCheckError,
            error: orderFeasibilityCheckError,
        },
    ] = useLazyCheckOrderFeasibilityQuery();
    useApiError(isOrderFeasibilityCheckError, orderFeasibilityCheckError, []);
    const eligibleCartProducts = useMemo(() => {
        return getEligibleCartProducts(cartProducts);
    }, [cartProducts]);

    useEffect(() => {
        checkOrderFeasibility(
            eligibleCartProducts.map((product) => ({
                productId: product.productId,
                quantity: product.quantity,
            })),
            true
        );
    }, [checkOrderFeasibility, eligibleCartProducts]);

    useEffect(() => {
        if (!orderFeasibilityCheckData) return;
        dispatch(
            localCartActions.updateCartProductsAvailability(
                orderFeasibilityCheckData
            )
        );
    }, [orderFeasibilityCheckData]);

    useEffect(() => {
        if (eligibleCartProducts.length === 0) return navigate('/');
        helpers.setValue(eligibleCartProducts);
    }, [cartProducts, navigate]);

    return (
        <section className={classes['checkout__order-products']}>
            {isCheckingOrderFeasbility && <LoadingScreen />}
            {orderFeasibilityCheckData &&
                field.value.map((cartProduct) => {
                    const {
                        initialImageUrl,
                        title,
                        quantity,
                        price,
                        productId,
                    } = cartProduct!;

                    return (
                        <OrderProduct
                            productId={productId}
                            previewURL={initialImageUrl}
                            title={title}
                            quantity={quantity}
                            price={price}
                            key={productId}
                        />
                    );
                })}
        </section>
    );
};

export default OrderProductList;
