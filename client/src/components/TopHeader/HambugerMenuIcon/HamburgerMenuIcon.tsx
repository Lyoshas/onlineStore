import { FC } from 'react';

import classes from './HamburgerMenuIcon.module.css';

const HamburgerMenuIcon: FC<{ onClick?: () => void }> = (props) => {
    return (
        <div className={classes['hamburger-block']} onClick={props.onClick}>
            <div className={classes['hamburger-block__line']} />
            <div className={classes['hamburger-block__line']} />
            <div className={classes['hamburger-block__line']} />
        </div>
    );
};

export default HamburgerMenuIcon;
