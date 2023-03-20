import { FC } from 'react';

const ErrorIcon: FC<{ className?: string }> = (props) => {
    return (
        <img
            src="/error-icon.svg"
            className={props.className || ''}
            alt="Error icon"
        />
    );
};

export default ErrorIcon;
