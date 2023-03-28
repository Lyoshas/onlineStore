import { FC } from 'react';

import classes from './Image.module.css';

const Image: FC<{ src: string; alt: string }> = (props) => {
    return <img src={props.src} className={classes.icon} alt={props.alt} />;
};

export default Image;
