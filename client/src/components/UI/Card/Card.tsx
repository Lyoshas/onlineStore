import React, { FC } from 'react';

import classes from './Card.module.css';

const Card: FC<{ children?: React.ReactNode; className?: string }> = (
    props
) => {
    return (
        <div className={`${classes['card']} ${props.className || ''}`}>
            {props.children}
        </div>
    );
};

export default Card;
