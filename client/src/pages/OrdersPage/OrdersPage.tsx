import { FC } from 'react';

import classes from './OrdersPage.module.css';
import Layout from '../../components/Layout/Layout';
import NavigationItems from './NavigationItems/NavigationItems';
import OrderList from './OrderList/OrderList';
import WarrantyRequestList from './WarrantyRequestList/WarrantyRequestList';

const OrderListPage: FC<{
    activePage: 'orders' | 'warranty requests';
}> = ({ activePage }) => {
    return (
        <Layout className={classes['orders-content-layout']}>
            <NavigationItems activePage={activePage} />
            {activePage === 'orders' && (
                <OrderList className={classes['focus-block_margin-top']} />
            )}
            {activePage === 'warranty requests' && (
                <WarrantyRequestList
                    className={classes['focus-block_margin-top']}
                />
            )}
        </Layout>
    );
};

export default OrderListPage;
