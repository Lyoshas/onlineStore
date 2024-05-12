import { FC } from 'react';
import classNames from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import classes from './Navigation.module.css';
import Image from '../Image/Image';
import { RootState } from '../../../store';
import getStaticAssetUrl from '../../../util/getStaticAssetUrl';

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

const PRODUCT_SEARCH_URL = '/search/products';
// onNavItemClick will be used to reset the hamburger menu upon navigation item click
const Navigation: FC<{ className?: string; onNavItemClick: () => void }> = (
    props
) => {
    const { isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );
    const location = useLocation();

    const linksInfo = [
        ['/products', 'Товари', getStaticAssetUrl('product-icon.svg')],
        [
            // the product search page contains some query parameters that may be set
            // if they are lost, it may cause some bugs, so this logic will preserve
            // all query parameters if a user is on the product search page
            location.pathname === PRODUCT_SEARCH_URL
                ? location.pathname + location.search
                : PRODUCT_SEARCH_URL,
            'Пошук товарів',
            getStaticAssetUrl('search-icon.svg'),
        ],
        isAuthenticated
            ? ['/user/orders', 'Замовлення', getStaticAssetUrl('order-icon.svg')]
            : null,
        [
            '/fundraising-campaigns',
            'Допомога армії',
            getStaticAssetUrl('shield-icon.svg'),
        ],
    ].filter((value) => value !== null) as string[][];

    return (
        <nav className={props.className}>
            <ul className={classNames(classes['navigation-ul'])}>
                {linksInfo.map(([to, label, imageURL], i) => (
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
