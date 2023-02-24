import { FC } from 'react';

import classes from './ErrorMessage.module.css';

const ErrorMessage: FC<{
    message: string;
    centered?: boolean;
    addBackground?: boolean;
}> = (props) => {
    const { message, centered = false, addBackground = false } = props;

    let className = classes['error-message'];
    if (centered) className += ' ' + classes.centered;
    if (addBackground) className += ' ' + classes['red-background'];

    return <p className={className}>{message}</p>
};

export default ErrorMessage;
