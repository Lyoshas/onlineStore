import { useSearchParams } from 'react-router-dom';
import { Fragment, useEffect } from 'react';

import FundraisingCampaignItem from '../../components/FundraisingCampaignItem/FundraisingCampaignItem';
import Layout from '../../components/Layout/Layout';
import NavigationItems from './NavigationItems/NavigationItems';
import { useLazyGetFundraisingCampaignsQuery } from '../../store/apis/fundraisingApi';
import LoadingScreen from '../../components/UI/LoadingScreen/LoadingScreen';
import ErrorMessageBlock from '../../components/UI/ErrorMessageBlock/ErrorMessageBlock';
import classes from './FundraisingCampaignList.module.css';

const FundraisingCampaignList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [
        getFundraisingCampaigns,
        { isFetching, isError, data, isUninitialized },
    ] = useLazyGetFundraisingCampaignsQuery();

    const currentStatus = searchParams.get('status');

    useEffect(() => {
        let newStatus: 'ongoing' | 'finished' =
            currentStatus === 'finished' ? 'finished' : 'ongoing';

        setSearchParams((prevSearchParams) => {
            prevSearchParams.set('status', newStatus);
            return prevSearchParams;
        });
        getFundraisingCampaigns({ status: newStatus });
    }, [currentStatus, setSearchParams, getFundraisingCampaigns]);

    return (
        <Layout>
            <NavigationItems
                activePage={
                    currentStatus === null || currentStatus === 'ongoing'
                        ? 'Ongoing campaigns'
                        : 'Finished campaigns'
                }
            />
            {(isUninitialized || isFetching) && <LoadingScreen />}
            {isError && (
                <ErrorMessageBlock
                    message="Something went wrong while retrieving fundraising campaigns. Please try reloading the page."
                    whiteBackground={false}
                    buttonLinks={<Fragment />}
                />
            )}
            {!isFetching && data && (
                <div className={classes['fundraising-campaign-list']}>
                    {data.fundraisingCampaigns.map((campaign, i) => (
                        <FundraisingCampaignItem
                            {...campaign}
                            divClassName={classes['fundraising-campaign__item']}
                            key={i}
                        />
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default FundraisingCampaignList;
