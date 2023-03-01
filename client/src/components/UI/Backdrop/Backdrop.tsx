import React, { FC } from 'react';
import classes from './Backdrop.module.css';

interface BackdropProps {
    children?: React.ReactNode;
    onClick?: () => void;
}

const Backdrop: FC<BackdropProps> = (props) => {
    return (
        <div className={classes.backdrop} onClick={props.onClick}>
            {props.children}
        </div>
    );
};

export default Backdrop;
