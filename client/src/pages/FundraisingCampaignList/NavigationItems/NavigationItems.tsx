import { FC } from 'react';

import SubnavigationItems from '../../../components/SubnavigationItems/SubnavigationItems';
import classes from './NavigationItems.module.css';

const links: {
    name: 'Активні збори' | 'Завершені збори';
    url: string;
}[] = [
    { name: 'Активні збори', url: '?status=ongoing' },
    { name: 'Завершені збори', url: '?status=finished' },
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
