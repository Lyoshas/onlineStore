import { FC } from 'react';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import classes from './Navigation.module.css';
import Image from '../Image/Image';

interface NavigationLinkProps {
    label: string;
    to: string;
    imageURL: string;
    onClick?: () => void;
}

const NavigationLink: FC<NavigationLinkProps> = (props) => {
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
                onClick={props.onClick}
            >
                <Image src={props.imageURL} alt={props.label} />
                {props.label}
            </NavLink>
        </li>
    );
};

// onNavItemClick will be used to reset the hamburger menu upon navigation item click
const Navigation: FC<{ className?: string; onNavItemClick: () => void }> = (
    props
) => {
    return (
        <nav className={props.className}>
            <ul className={classes['navigation-ul']}>
                {[
                    ['/', 'Home', '/home-icon.svg'],
                    ['/products', 'Products', '/product-icon.svg'],
                    ['/orders', 'Orders', '/order-icon.svg'],
                ].map(([to, label, imageURL], i) => (
                    <NavigationLink
                        key={i}
                        to={to}
                        label={label}
                        imageURL={imageURL}
                        onClick={props.onNavItemClick}
                    />
                ))}
            </ul>
        </nav>
    );
};

export default Navigation;
