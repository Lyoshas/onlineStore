import { FC } from 'react';

import classes from './NavigationItems.module.css';
import SubnavigationItems from '../../../components/SubnavigationItems/SubnavigationItems';

const linksInfo: { name: 'Замовлення' | 'Гарантійні запити'; url: string }[] = [
    { name: 'Замовлення', url: '/user/orders' },
    {
        name: 'Гарантійні запити',
        url: '/user/orders/warranty-requests',
    },
];

const NavigationItems: FC<{ activePage: 'Замовлення' | 'Гарантійні запити' }> = (
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
