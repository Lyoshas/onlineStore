import { FC } from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import classes from './Navigation.module.css';
import Image from '../Image/Image';

const NavigationLink: FC<{ label: string; to: string; imageURL: string }> = (
    props
) => {
    return (
        <li className={classes['navigation__li']}>
            <NavLink
                to={props.to}
                className={({ isActive }) => {
                    return classNames(
                        classes['navigation__link'],
                        isActive && classes.active
                    );
                }}
            >
                <Image src={props.imageURL} alt={props.label} />
                {props.label}
            </NavLink>
        </li>
    );
};

const Navigation: FC<{ className?: string }> = (props) => {
    return (
        <nav className={props.className}>
            <ul className={classes['navigation-ul']}>
                <NavigationLink to="/" label="Home" imageURL="/home-icon.svg" />
                <NavigationLink
                    to="/products"
                    label="Products"
                    imageURL="/product-icon.svg"
                />
                <NavigationLink
                    to="/orders"
                    label="Orders"
                    imageURL="/order-icon.svg"
                />
            </ul>
        </nav>
    );
};

export default Navigation;
