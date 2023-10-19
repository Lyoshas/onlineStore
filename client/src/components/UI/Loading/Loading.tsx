import { FC } from 'react';
import classNames from 'classnames';

import classes from './Loading.module.css';

interface LoadingProps {
    width?: string;
    height?: string;
    color?: string;
    className?: string;
}

const Loading: FC<LoadingProps> = (props) => {
    const className = classNames(classes.loader, props.className);

    return (
        <span
            className={className}
            style={{
                width: props.width,
                height: props.height,
                borderColor: props.color || '#fff',
                // borderBottomColor was added here for technical reasons. If this remained in the CSS file, borderColor would overwrite this property
                borderBottomColor: 'transparent',
            }}
        ></span>
    );
};

export default Loading;
