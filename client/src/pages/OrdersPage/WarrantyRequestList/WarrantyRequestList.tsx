import { FC, Fragment } from 'react';
import classNames from 'classnames';

import { useGetWarrantyRequestListQuery } from '../../../store/apis/warrantyRequestApi';
import classes from './WarrantyRequestList.module.css';
import LoadingScreen from '../../../components/UI/LoadingScreen/LoadingScreen';
import WarrantyRequestItem from './WarrantyRequestItem/WarrantyRequestItem';
import ErrorMessageBlock from '../../../components/UI/ErrorMessageBlock/ErrorMessageBlock';

const WarrantyRequestList: FC<{ className?: string }> = (props) => {
    const { isLoading, isError, data } = useGetWarrantyRequestListQuery();

    return (
        <div
            className={classNames(
                classes['warranty-request-list'],
                props.className
            )}
        >
            {isError && (
                <ErrorMessageBlock
                    whiteBackground={false}
                    message="Щось пішло не так під час відображення списку запитів на гарантійне обслуговування. Спробуйте перезавантажити сторінку."
                    buttonLinks={<Fragment />}
                />
            )}
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
                        У вас поки немає запитів до сервісного центру.
                    </p>
                ))}
        </div>
    );
};

export default WarrantyRequestList;
