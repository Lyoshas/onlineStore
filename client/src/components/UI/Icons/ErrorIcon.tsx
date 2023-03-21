import { FC } from 'react';

const ErrorIcon: FC<{ className?: string }> = (props) => {
    return (
        <img
            src="/error-icon.png"
            className={props.className || ''}
            alt="Error icon"
        />
    );
};

export default ErrorIcon;
