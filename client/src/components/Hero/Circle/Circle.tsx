import { FC } from 'react';
import classNames from 'classnames';

import classes from './Circle.module.css';

interface CircleProps {
    className?: string;
    style?: React.CSSProperties;
}

const Circle: FC<CircleProps> = (props) => {
    return (
        <div
            className={classNames(classes.circle, props.className)}
            style={props.style}
        ></div>
    );
};

export default Circle;
