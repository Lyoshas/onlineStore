import { FC } from 'react';
import classNames from 'classnames';

import classes from './Layout.module.css';

const Layout: FC<{ children: React.ReactNode; className?: string }> = (
    props
) => {
    const classnames = classNames(classes.layout, props.className);
    return <div className={classnames}>{props.children}</div>;
};

export default Layout;
