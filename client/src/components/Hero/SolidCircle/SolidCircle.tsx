import { FC } from 'react';
import Circle from '../Circle/Circle';
import classes from './SolidCircle.module.css';

const SolidCircle: FC<{ offset: number }> = (props) => {
    return (
        <Circle
            className={classes['solid-circle']}
            style={{ transform: `translateX(${props.offset * 0.15 * 0.2}px)` }}
        />
    );
};

export default SolidCircle;
