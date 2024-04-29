import { FC } from 'react';

import SubnavigationItems from '../../../components/SubnavigationItems/SubnavigationItems';
import classes from './NavigationItems.module.css';

const links: {
    name: 'Ongoing campaigns' | 'Finished campaigns';
    url: string;
}[] = [
    { name: 'Ongoing campaigns', url: '?status=ongoing' },
    { name: 'Finished campaigns', url: '?status=finished' },
];

const NavigationItems: FC<{ activePage: (typeof links)[0]['name'] }> = (
    props
) => {
    return (
        <SubnavigationItems
            links={links}
            selectedLink={props.activePage}
            divBlockClassName={classes['fundraising-subnavigation-items']}
            linkItemClassName={classes['fundraising-subnavigation-items__link']}
        />
    );
};

export default NavigationItems;
