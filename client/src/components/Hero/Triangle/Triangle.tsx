import { CSSProperties, FC } from 'react';
import classNames from 'classnames';

import classes from './Triangle.module.css';

interface TriangleProps {
    className: string;
    style: CSSProperties;
}

const Triangle: FC<TriangleProps> = (props) => {
    return (
        <div
            className={classNames(classes.triangle, props.className)}
            style={props.style}
        />
    );
};

export default Triangle;
