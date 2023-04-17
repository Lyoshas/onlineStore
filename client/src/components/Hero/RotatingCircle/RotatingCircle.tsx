import { FC } from 'react';

import Circle from '../Circle/Circle';
import classes from './RotatingCircle.module.css';

const RotatingCircle: FC<{ pageYOffset: number }> = (props) => {
    return (
        // div is needed to apply "transform: translateY()"
        <div
            className={classes['rotating-circle-block']}
            style={{ transform: `translateY(${props.pageYOffset * 0.3}px)` }}
        >
            <Circle className={classes['rotating-circle']} />
        </div>
    );
};

export default RotatingCircle;
