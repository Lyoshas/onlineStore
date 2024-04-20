import { FC } from 'react';
import OrderItem from './OrderItem/OrderItem';
import classes from './OrderList.module.css';
import classNames from 'classnames';

import LoadingScreen from '../../../components/UI/LoadingScreen/LoadingScreen';
import { useGetOrderListQuery } from '../../../store/apis/orderApi';
import ErrorIcon from '../../../components/UI/Icons/ErrorIcon';

const ErrorMessage = () => {
    return (
        <div className={classes['order-page__error-message']}>
            <ErrorIcon className="icon" />
            <p>
                Something went wrong while displaying a list of orders. Please
                try reloading the page.
            </p>
        </div>
    );
};

const OrderList: FC<{ className?: string }> = (props) => {
    const { isLoading, isError, data } = useGetOrderListQuery();

    return (
        <div className={classNames(classes['order-list'], props.className)}>
            {isError && !data && <ErrorMessage />}
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
