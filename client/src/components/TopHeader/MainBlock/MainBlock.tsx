import React, { FC } from 'react';
import classNames from 'classnames';

import classes from './MainBlock.module.css';

const MainBlock: FC<{
    children: React.ReactNode;
    className?: string | null;
}> = (props) => {
    return (
        <main className={classNames(classes['main-block'], props.className)}>
            {props.children}
        </main>
    );
};

export default MainBlock;
