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
                    message="Щось пішло не так під час відображення списку замовлень. Спробуйте перезавантажити сторінку."
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
                        У вас поки немає жодних замовлень.
                    </p>
                ))}
        </div>
    );
};

export default OrderList;
