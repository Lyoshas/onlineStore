import { FC, Fragment } from 'react';
import OrderItem from './OrderItem/OrderItem';
import classes from './OrderList.module.css';
import classNames from 'classnames';

import LoadingScreen from '../../../components/UI/LoadingScreen/LoadingScreen';
import { useGetOrderListQuery } from '../../../store/apis/orderApi';
import ErrorMessageBlock from '../../../components/UI/ErrorMessageBlock/ErrorMessageBlock';

const OrderList: FC<{ className?: string }> = (props) => {
    const { isLoading, isError, data } = useGetOrderListQuery();

    return (
        <div className={classNames(classes['order-list'], props.className)}>
            {isError && !data && (
                <ErrorMessageBlock
                    message="Something went wrong while displaying a list of orders. Please try reloading the page."
                    whiteBackground={false}
                    buttonLinks={<Fragment />}
                />
            )}
            {isLoading && <LoadingScreen />}
            {!isLoading &&
                data &&
                (data.orders.length > 0 ? (
                    data.orders.map((order, index) => (
                        <OrderItem orderData={order} key={index} />
                    ))
                ) : (
                    <p className={classes['order-list__warning']}>
                        You don't have any orders yet.
                    </p>
                ))}
        </div>
    );
};

export default OrderList;
