import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import buttonClasses from '../Button/Button.module.css';
import classes from './ButtonLink.module.css';

interface ButtonLinkProps {
    to: string;
    className?: string;
    children?: React.ReactNode;
}

// "to" is the link itself
const ButtonLink: FC<ButtonLinkProps> = (props) => {
    const className = classNames(
        buttonClasses.button,
        classes['button-link'],
        props.className
    );

    return (
        <Link to={props.to} className={className}>
            {props.children}
        </Link>
    );
};

export default ButtonLink;
