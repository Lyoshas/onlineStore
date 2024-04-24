import { FC } from 'react';
import classNames from 'classnames';

import classes from './HamburgerMenuIcon.module.css';

interface HamburgerMenuIconProps {
    onClick?: () => void;
}

const HamburgerMenuIcon: FC<HamburgerMenuIconProps> = (props) => {
    return (
        <div
            className={classNames(classes['hamburger-block'])}
            onClick={props.onClick}
        >
            <div className={classes['hamburger-block__line']} />
            <div className={classes['hamburger-block__line']} />
            <div className={classes['hamburger-block__line']} />
        </div>
    );
};

export default HamburgerMenuIcon;
