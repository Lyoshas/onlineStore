import React, { FC, forwardRef } from 'react';

import classes from './Card.module.css';

interface CardProps {
    children?: React.ReactNode;
    className?: string;
    onClick?: (event: React.MouseEvent) => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
    return (
        <div
            className={`${classes['card']} ${props.className || ''}`}
            onClick={props.onClick}
            ref={ref}
        >
            {props.children}
        </div>
    );
});

export default Card;
