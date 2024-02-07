import React, { FC, ReactNode } from 'react';

import classes from './Button.module.css';
import classNames from 'classnames';

const Button: FC<{
    children?: ReactNode;
    type?: 'button' | 'submit' | 'reset' | undefined;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => any;
    className?: string;
    disabled?: boolean;
    colorTheme?: 1 | 2;
}> = ({ colorTheme = 1, ...props }) => {
    return (
        <button
            type={props.type || 'button'}
            className={classNames(
                classes.button,
                props.className,
                colorTheme === 1
                    ? classes['default-color-theme']
                    : classes['second-color-theme']
            )}
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
};

export default Button;
