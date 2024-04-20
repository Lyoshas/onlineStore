import { FC } from 'react';

import classes from './StatusHistoryList.module.css';

const StatusHistoryList: FC<{
    statusChangeHistory: {
        status: string;
        statusChangeTime: string;
    }[];
}> = (props) => {
    return (
        <ol className={classes['status-history-list']}>
            {props.statusChangeHistory.map(
                ({ status, statusChangeTime }, index) => (
                    <li key={index}>
                        <b>{statusChangeTime}</b> - {status}
                    </li>
                )
            )}
        </ol>
    );
};

export default StatusHistoryList;
