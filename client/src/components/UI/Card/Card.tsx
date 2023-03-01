import React, { FC } from 'react';

import classes from './Card.module.css';

const Card: FC<{
    children?: React.ReactNode;
    className?: string;
    onClick?: (event: React.MouseEvent) => void;
}> = (props) => {
    return (
        <div
            className={`${classes['card']} ${props.className || ''}`}
            onClick={props.onClick}
        >
            {props.children}
        </div>
    );
};

export default Card;
