import React, { FC } from 'react';

import classes from './ErrorMessage.module.css';

const ErrorMessage: FC<{
    centered?: boolean;
    addBackground?: boolean;
    children: React.ReactNode;
}> = (props) => {
    const { centered = false, addBackground = false } = props;

    let className = classes['error-message'];
    if (centered) className += ' ' + classes.centered;
    if (addBackground) className += ' ' + classes['red-background'];

    return <p className={className}>{props.children}</p>
};

export default ErrorMessage;
