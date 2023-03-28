import React, { FC } from 'react';

import classes from './MainBlock.module.css';

const MainBlock: FC<{ children: React.ReactNode }> = (props) => {
    return <main className={classes['main-block']}>{props.children}</main>;
};

export default MainBlock;
