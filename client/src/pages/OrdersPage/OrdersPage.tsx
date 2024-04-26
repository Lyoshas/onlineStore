import { FC } from 'react';

import classes from './OrdersPage.module.css';
import Layout from '../../components/Layout/Layout';
import OrderList from './OrderList/OrderList';
import WarrantyRequestList from './WarrantyRequestList/WarrantyRequestList';
import NavigationItems from './NavigationItems/NavigationItems';

const OrderListPage: FC<{
    activePage: 'Orders' | 'Warranty requests';
}> = ({ activePage }) => {
    return (
        <Layout className={classes['orders-content-layout']}>
            <NavigationItems activePage={activePage} />
            {activePage === 'Orders' && (
                <OrderList className={classes['focus-block_margin-top']} />
            )}
            {activePage === 'Warranty requests' && (
                <WarrantyRequestList
                    className={classes['focus-block_margin-top']}
                />
            )}
        </Layout>
    );
};

export default OrderListPage;
