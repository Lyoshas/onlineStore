import React, { forwardRef } from 'react';
import classNames from 'classnames';

import classes from './Card.module.css';

interface CardProps {
    children?: React.ReactNode;
    className?: string;
    onClick?: (event: React.MouseEvent) => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>((props, ref) => {
    return (
        <article
            className={classNames(classes.card, props.className)}
            onClick={props.onClick}
            ref={ref}
        >
            {props.children}
        </article>
    );
});

export default Card;
