import { FC } from 'react';

import classes from './HamburgerMenuIcon.module.css';
import classNames from 'classnames';

interface HamburgerMenuIconProps {
    onClick?: () => void;
    // null means that the admin status hasn't been determined yet
    isAdmin: boolean | null;
}

const HamburgerMenuIcon: FC<HamburgerMenuIconProps> = (props) => {
    return (
        <div
            className={classNames(
                classes['hamburger-block'],
                props.isAdmin && classes.admin
            )}
            onClick={props.onClick}
        >
            <div className={classes['hamburger-block__line']} />
            <div className={classes['hamburger-block__line']} />
            <div className={classes['hamburger-block__line']} />
        </div>
    );
};

export default HamburgerMenuIcon;
