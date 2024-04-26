import { FC } from 'react';

import classes from './NavigationItems.module.css';
import SubnavigationItems from '../../../components/SubnavigationItems/SubnavigationItems';

const linksInfo: { name: 'Orders' | 'Warranty requests'; url: string }[] = [
    { name: 'Orders', url: '/user/orders' },
    {
        name: 'Warranty requests',
        url: '/user/orders/warranty-requests',
    },
];

const NavigationItems: FC<{ activePage: 'Orders' | 'Warranty requests' }> = (
    props
) => {
    return (
        <SubnavigationItems
            links={linksInfo}
            selectedLink={props.activePage}
            divBlockClassName={classes['order-subnavigation-items']}
            linkItemClassName={classes['order-subnavigation-items__link']}
        />
    );
};

export default NavigationItems;
