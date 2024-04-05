import { Link } from 'react-router-dom';
import classNames from 'classnames';

import classes from './NavigationItems.module.css';
import { FC } from 'react';

const NavigationItems: FC<{ activePage: 'orders' | 'warranty requests' }> = (
    props
) => {
    return (
        <div className={classes['order-navigation-items']}>
            <Link
                to="/user/orders"
                className={classNames(
                    classes['order-navigation-items__link'],
                    props.activePage === 'orders' &&
                        classes['order-nevigation-item__link_underline']
                )}
            >
                Orders
            </Link>
            <Link
                to="/user/orders/warranty-requests"
                className={classNames(
                    classes['order-navigation-items__link'],
                    props.activePage === 'warranty requests' &&
                        classes['order-nevigation-item__link_underline']
                )}
            >
                Warranty requests
            </Link>
        </div>
    );
};

export default NavigationItems;
