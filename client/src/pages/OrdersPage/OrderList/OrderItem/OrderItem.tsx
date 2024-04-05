import classNames from 'classnames';
import { FC, useCallback, useState } from 'react';

import formatCurrencyUAH from '../../../../util/formatCurrencyUAH';
import classes from './OrderItem.module.css';

const OrderItem: FC<{
    orderData: {
        orderId: number;
        previewURL: string;
        paymentMethod: string;
        totalPrice: number;
        isPaid: boolean;
        creationTime: string;
        statusChangeHistory: {
            orderStatus: string;
            statusChangeTime: string;
        }[];
        deliveryPostalService: {
            name: string;
            warehouseDescription: string;
        };
        recipient: {
            firstName: string;
            lastName: string;
            phoneNumber: string;
        };
    };
}> = ({ orderData }) => {
    const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);

    const toggleShowOrderDetails = useCallback(() => {
        setShowOrderDetails((previousValue) => !previousValue);
    }, [setShowOrderDetails]);

    return (
        <div className={classes['order-list__item']}>
            <div
                className={classes['order-item__summary']}
                onClick={toggleShowOrderDetails}
            >
                <div className={classes['order-item__preview-img-block']}>
                    <img
                        className={classes['order-item__preview-img']}
                        src={orderData.previewURL}
                        alt={`order-img-${orderData.orderId}`}
                    />
                </div>
                <div className={classes['order-item__summary-text']}>
                    <span className={classes['order-item__identifier']}>
                        Order №{orderData.orderId}
                    </span>
                    <span>{orderData.creationTime}</span>
                    <span className={classes['order-item__total-price']}>
                        {formatCurrencyUAH(orderData.totalPrice)}
                    </span>
                </div>
                <div className={classes['order-item__expand-block']}>
                    <img
                        className={classNames(
                            showOrderDetails &&
                                classes['expand-block__item_rotated']
                        )}
                        src="https://onlinestore-react-assets.s3.eu-north-1.amazonaws.com/expand-arrow.svg"
                        alt="expand-arrow"
                    />
                </div>
            </div>
            <div
                className={classNames(
                    classes['order-item__details'],
                    !showOrderDetails && classes['hidden']
                )}
            >
                <div className={classes['order-item__status-history']}>
                    <h3 className={classes['order-status-history__heading']}>
                        Order status history:
                    </h3>
                    <ol className={classes['order-item__status-history-list']}>
                        {orderData.statusChangeHistory.map(
                            ({ orderStatus, statusChangeTime }, index) => (
                                <li key={index}>
                                     <b>{statusChangeTime}</b> - {orderStatus}
                                </li>
                            )
                        )}
                    </ol>
                </div>
                <div className={classes['order-item__delivery-data']}>
                    <dl className={classes['delivery-data__term-list']}>
                        <dt className={classes['delivery-data__term']}>
                            Delivery method:
                        </dt>
                        <dd className={classes['delivery-data__definition']}>
                            {orderData.deliveryPostalService.name} (
                            {
                                orderData.deliveryPostalService
                                    .warehouseDescription
                            }
                            )
                        </dd>
                        <dt className={classes['delivery-data__term']}>
                            Recipient contact data:
                        </dt>
                        <dd className={classes['delivery-data__definition']}>
                            {`${orderData.recipient.firstName} ${orderData.recipient.lastName} (${orderData.recipient.phoneNumber})`}
                        </dd>
                        <dt className={classes['delivery-data__term']}>
                            Payment Method:
                        </dt>
                        <dd className={classes['delivery-data__definition']}>
                            {orderData.paymentMethod}
                        </dd>
                        <dt className={classes['delivery-data__term']}>
                            Payment status:
                        </dt>
                        <dd className={classes['delivery-data__definition']}>
                            {orderData.isPaid ? 'paid for' : 'not paid for'}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    );
};

export default OrderItem;
