import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import buttonClasses from '../Button/Button.module.css';
import classes from './ButtonLink.module.css';

// "to" is the link itself
const ButtonLink: FC<{ to: string; children?: React.ReactNode }> = (props) => {
    return (
        <Link
            to={props.to}
            className={`${buttonClasses.button} ${classes['button-link']}`}
        >
            {props.children}
        </Link>
    );
};

export default ButtonLink;
