import { FC, Fragment } from 'react';

import formatCurrencyUAH from '../../../../util/formatCurrencyUAH';
import classes from './OrderItem.module.css';
import ExpandableBlock from '../../../../components/UI/ExpandableBlock/ExpandableBlock';
import StatusHistoryList from '../../StatusHistoryList/StatusHistoryList';
import PreviewImage from '../../PreviewImage/PreviewImage';

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
    return (
        <ExpandableBlock
            summaryBlockClassName={classes['order-item__summary']}
            detailsBlockClassName={classes['order-item__details']}
            expandArrowBlockClassName={
                classes['order-item__expand-arrow-block']
            }
            SummaryContent={
                <Fragment>
                    <PreviewImage
                        previewURL={orderData.previewURL}
                        imageId={orderData.orderId}
                        previewImgBlockClassName={
                            classes['order-item__preview-img-block']
                        }
                    />
                    <div className={classes['order-item__summary-text']}>
                        <span className={classes['order-item__identifier']}>
                            Order №{orderData.orderId}
                        </span>
                        <span>{orderData.creationTime}</span>
                        <span className={classes['order-item__total-price']}>
                            {formatCurrencyUAH(orderData.totalPrice)}
                        </span>
                    </div>
                </Fragment>
            }
            DetailsContent={
                <Fragment>
                    <div className={classes['order-item__status-history']}>
                        <h3
                            className={classes['order-status-history__heading']}
                        >
                            Order status history:
                        </h3>
                        <StatusHistoryList
                            statusChangeHistory={orderData.statusChangeHistory.map(
                                (statusEntry) => ({
                                    status: statusEntry.orderStatus,
                                    statusChangeTime:
                                        statusEntry.statusChangeTime,
                                })
                            )}
                        />
                    </div>
                    <div className={classes['order-item__delivery-data']}>
                        <dl className={classes['delivery-data__term-list']}>
                            <dt className={classes['delivery-data__term']}>
                                Delivery method:
                            </dt>
                            <dd
                                className={classes['delivery-data__definition']}
                            >
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
                            <dd
                                className={classes['delivery-data__definition']}
                            >
                                {`${orderData.recipient.firstName} ${orderData.recipient.lastName} (${orderData.recipient.phoneNumber})`}
                            </dd>
                            <dt className={classes['delivery-data__term']}>
                                Payment Method:
                            </dt>
                            <dd
                                className={classes['delivery-data__definition']}
                            >
                                {orderData.paymentMethod}
                            </dd>
                            <dt className={classes['delivery-data__term']}>
                                Payment status:
                            </dt>
                            <dd
                                className={classes['delivery-data__definition']}
                            >
                                {orderData.isPaid ? 'paid for' : 'not paid for'}
                            </dd>
                        </dl>
                    </div>
                </Fragment>
            }
        />
    );
};

export default OrderItem;
