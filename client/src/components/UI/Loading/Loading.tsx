import { FC } from 'react';

import classes from './Loading.module.css';

const Loading: FC<{ width?: string; height?: string; color?: string }> = (
    props
) => {
    return (
        <span
            className={classes.loader}
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
