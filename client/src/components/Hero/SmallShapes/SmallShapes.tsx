import { FC, Fragment } from 'react';

import Circle from '../Circle/Circle';
import Triangle from '../Triangle/Triangle';
import classes from './SmallShapes.module.css';
import CircleGrid from '../CircleGrid/CircleGrid';

const SmallShapes: FC<{ pageYOffset: number }> = ({ pageYOffset }) => {
    const offset = pageYOffset * 0.1;

    return (
        <Fragment>
            <Triangle
                className={classes['hero__triangle-item_lightred']}
                style={{ transform: `translateY(-${offset}px) rotate(20deg)` }}
            />
            <Triangle
                className={classes['hero__triangle-item_lightblue']}
                style={{
                    transform: `translate(-${offset}px, ${offset}px) rotateY(${pageYOffset}deg)`,
                }}
            />
            <Triangle
                className={classes['hero__triangle-item_lightgreen']}
                style={{
                    transform: `translate(-${offset}px, ${offset}px) rotateY(${pageYOffset}deg) rotate(45deg)`,
                }}
            />
            <div
                className={classes['pulsating-circle-block']}
                style={{ transform: `translate(${offset}px, ${offset}px)` }}
            >
                <Circle className={classes['hero__pulsating-circle']} />
            </div>
            <Circle
                className={classes['hero__circle-item_purple']}
                style={{ transform: `translate(-${offset}px, ${offset}px)` }}
            />
            <div
                className={classes['circle-grid-block']}
                style={{ transform: `translateY(${offset}px)` }}
            >
                <CircleGrid />
            </div>
        </Fragment>
    );
};

export default SmallShapes;
