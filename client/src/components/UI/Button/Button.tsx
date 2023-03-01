import React, { FC, ReactNode } from 'react';

import classes from './Button.module.css';

const Button: FC<{
    children?: ReactNode;
    type?: 'button' | 'submit' | 'reset' | undefined;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => any;
    className?: string;
    disabled?: boolean;
}> = (props) => {
    return (
        <button
            type={props.type || 'button'}
            className={`${classes.button} ${props.className || ''}`}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
};

export default Button;
