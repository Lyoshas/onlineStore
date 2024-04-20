import { FC, Fragment } from 'react';

import ExpandableBlock from '../../../../components/UI/ExpandableBlock/ExpandableBlock';
import classes from './WarrantyRequestItem.module.css';
import StatusHistoryList from '../../StatusHistoryList/StatusHistoryList';
import PreviewImage from '../../PreviewImage/PreviewImage';

interface WarrantyRequestInfo {
    warrantyRequest: {
        id: number;
        issueDescription: string;
        serviceCenter: string;
        userDataRequestInitiator: {
            firstName: string;
            lastName: string;
            email: string;
        };
        repairingProductData: {
            title: string;
            previewURL: string;
        };
        statusHistory: {
            statusChangeTime: string;
            status: string;
        }[];
    };
}

const WarrantyRequestItem: FC<WarrantyRequestInfo> = ({ warrantyRequest }) => {
    const user = warrantyRequest.userDataRequestInitiator;
    return (
        <ExpandableBlock
            summaryBlockClassName={classes['warranty-request__summary-block']}
            detailsBlockClassName={classes['warranty-request__details-block']}
            expandArrowBlockClassName={
                classes['warranty-request__expand-arrow-block']
            }
            SummaryContent={
                <Fragment>
                    <PreviewImage
                        previewURL={
                            warrantyRequest.repairingProductData.previewURL
                        }
                        imageId={warrantyRequest.id}
                        previewImgBlockClassName={
                            classes['warranty-request__preview-img']
                        }
                    />
                    <div className={classes['warranty-request__summary-text']}>
                        <span
                            className={classes['warranty-request__identifier']}
                        >
                            Request №{warrantyRequest.id}
                        </span>
                        <span>
                            {
                                warrantyRequest.statusHistory[
                                    warrantyRequest.statusHistory.length - 1
                                ].statusChangeTime.split(' ')[0]
                            }
                        </span>
                        <span
                            className={classes['warranty-request__last-status']}
                        >
                            <b>Last status:</b>{' '}
                            {warrantyRequest.statusHistory[0].status}
                        </span>
                    </div>
                </Fragment>
            }
            DetailsContent={
                <Fragment>
                    <div
                        className={
                            classes['warranty-request__details-flex-container']
                        }
                    >
                        <h3 className={classes['warranty-request__heading']}>
                            Related product:
                        </h3>
                        <p>{warrantyRequest.repairingProductData.title}</p>
                        <h3 className={classes['warranty-request__heading']}>
                            Status history:
                        </h3>
                        <StatusHistoryList
                            statusChangeHistory={warrantyRequest.statusHistory}
                        />
                    </div>
                    <div
                        className={
                            classes['warranty-request__details-flex-container']
                        }
                    >
                        <h3 className={classes['warranty-request__heading']}>
                            Service center address
                        </h3>
                        <p>{warrantyRequest.serviceCenter}</p>
                        <h3 className={classes['warranty-request__heading']}>
                            Client contact data
                        </h3>
                        <p
                            className={
                                classes['warranty-request__user-contact-data']
                            }
                        >
                            {user.firstName} {user.lastName}
                            <br />({user.email})
                        </p>
                    </div>
                </Fragment>
            }
        />
    );
};

export default WarrantyRequestItem;
