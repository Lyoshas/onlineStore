import { FC } from 'react';
import classNames from 'classnames';

import { useGetWarrantyRequestListQuery } from '../../../store/apis/warrantyRequestApi';
import classes from './WarrantyRequestList.module.css';
import LoadingScreen from '../../../components/UI/LoadingScreen/LoadingScreen';
import ErrorIcon from '../../../components/UI/Icons/ErrorIcon';
import WarrantyRequestItem from './WarrantyRequestItem/WarrantyRequestItem';

const ErrorMessage = () => {
    return (
        <div className={classes['order-page__error-message']}>
            <ErrorIcon className="icon" />
            <p>
                Something went wrong while displaying a list of warranty
                requests. Please try reloading the page.
            </p>
        </div>
    );
};

const WarrantyRequestList: FC<{ className?: string }> = (props) => {
    const { isLoading, isError, data } = useGetWarrantyRequestListQuery();

    console.log('hello');

    return (
        <div
            className={classNames(
                classes['warranty-request-list'],
                props.className
            )}
        >
            {isError && <ErrorMessage />}
            {isLoading && <LoadingScreen />}
            {!isLoading &&
                data &&
                (data.warrantyRequests.length > 0 ? (
                    data.warrantyRequests.map((warrantyRequest, index) => (
                        <WarrantyRequestItem
                            warrantyRequest={warrantyRequest}
                            key={index}
                        />
                    ))
                ) : (
                    <p className={classes['order-list__warning']}>
                        You don't have any orders yet.
                    </p>
                ))}
        </div>
    );
};

export default WarrantyRequestList;
