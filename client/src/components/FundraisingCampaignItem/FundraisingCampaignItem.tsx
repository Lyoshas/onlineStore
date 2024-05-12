import { FC, useCallback, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';

import Card from '../UI/Card/Card';
import classes from './FundraisingCampaignItem.module.css';
import Button from '../UI/Button/Button';
import formatCurrencyUAH from '../../util/formatCurrencyUAH';
import Progress from '../UI/Progress/Progress';
import DonationModal from './DonationModal/DonationModal';
import { RootState } from '../../store';

const FundraisingCampaignItem: FC<{
    id: number;
    title: string;
    financialObjective: number;
    previewUrl: string;
    raisedMoney: number;
    fundingProgressPercentage: number;
    divClassName?: string;
}> = (props) => {
    const [showModal, setShowContributeModal] = useState<boolean>(false);
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    const showContributeModal = useCallback(() => {
        setShowContributeModal(true);
    }, [setShowContributeModal]);

    const hideContributeModal = useCallback(() => {
        setShowContributeModal(false);
    }, [setShowContributeModal]);

    return (
        <Card
            className={classNames(
                classes['campaign-block'],
                props.divClassName
            )}
        >
            <div className={classes['campaign-img-block']}>
                <img
                    src={props.previewUrl}
                    className={classes['campaign-img__item']}
                    alt={`Campaign ${props.id} image`}
                />
            </div>
            <h2 className={classes['campaign__title']}>{props.title}</h2>
            <p className={classes['campaign__money-objective']}>
                <b>Мета:</b>{' '}
                <span className={classes['campaign__money-objective-value']}>
                    {formatCurrencyUAH(props.financialObjective)}
                </span>
            </p>
            <p className={classes['campaign__money-raised']}>
                <b>Зібрано:</b>{' '}
                <span className={classes['campaign__money-raised-value']}>
                    {formatCurrencyUAH(props.raisedMoney)}
                </span>
            </p>
            <Progress
                value={props.fundingProgressPercentage}
                progressBarDivClassName={
                    classes['campaign__funding-progress-bar']
                }
            />
            {props.fundingProgressPercentage !== 100 && isAuthenticated && (
                <Button onClick={showContributeModal}>Зробити внесок</Button>
            )}
            {showModal && (
                <DonationModal
                    campaignId={props.id}
                    onClose={hideContributeModal}
                />
            )}
        </Card>
    );
};

export default FundraisingCampaignItem;
