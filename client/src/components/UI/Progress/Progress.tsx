import { FC } from 'react';
import classNames from 'classnames';

import classes from './Progress.module.css';

// "value" should not exceed 100
const Progress: FC<{
    value: number;
    progressBarDivClassName?: string;
    progressFillDivClassName?: string;
}> = ({ value, ...props }) => {
    const fillPercent = value < 0 ? 0 : value > 100 ? 100 : value;

    return (
        <div
            className={classNames(
                classes['progress-bar'],
                props.progressBarDivClassName
            )}
        >
            <div
                className={classNames(
                    classes['progress-bar__fill'],
                    props.progressFillDivClassName
                )}
                style={{ width: `${fillPercent}%` }}
            ></div>
        </div>
    );
};

export default Progress;
