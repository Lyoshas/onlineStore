import { FC } from 'react';

import classes from './Loading.module.css';

const Loading: FC<{ width?: string; height?: string }> = (props) => {
    return (
        <span
            className={classes.loader}
            style={{ width: props.width, height: props.height }}
        ></span>
    );
};

export default Loading;
