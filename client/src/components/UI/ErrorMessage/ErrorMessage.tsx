import React, { FC } from 'react';
import classNames from 'classnames';

import classes from './ErrorMessage.module.css';

const ErrorMessage: FC<{
    centered?: boolean;
    addBackground?: boolean;
    className?: string;
    children: React.ReactNode;
}> = (props) => {
    const { centered = false, addBackground = false } = props;

    let className = classNames(classes['error-message'], props.className);
    if (centered) className += ' ' + classes.centered;
    if (addBackground) className += ' ' + classes['red-background'];

    return <p className={className}>{props.children}</p>;
};

export default ErrorMessage;
