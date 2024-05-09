import { useNavigate, useSearchParams } from 'react-router-dom';
import { Fragment, useEffect, useState } from 'react';

import ErrorMessageBlock from '../../components/UI/ErrorMessageBlock/ErrorMessageBlock';
import SuccessMessageBlock from '../../components/UI/SuccessMessageBlock/SuccessMessageBlock';
import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';

const ButtonLinks = () => {
    return (
        <ButtonLink to="/fundraising-campaigns">
            Fundraising Campaigns
        </ButtonLink>
    );
};

const SuccessMessage = () => {
    return (
        <SuccessMessageBlock
            content={
                <Fragment>
                    <p>Thank you for your donation!</p>
                    <ButtonLinks />
                </Fragment>
            }
        />
    );
};

const TransactionAlreadyPaidForError = () => {
    return (
        <ErrorMessageBlock
            message="The transaction has already been paid for."
            buttonLinks={<ButtonLinks />}
        />
    );
};

const PaymentCancelledError = () => {
    return (
        <ErrorMessageBlock
            message="The payment has been canceled, resulting in the cancellation of the transaction. Please contribute one more time to retry."
            buttonLinks={<ButtonLinks />}
        />
    );
};

const PaymentFailedError = () => {
    return (
        <ErrorMessageBlock
            message="An error occurred during the payment process, leading to the cancellation of the transaction. Please initiate a new transaction to try again."
            buttonLinks={<ButtonLinks />}
        />
    );
};

const FundraisingCampaignCallback = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [showSuccessMessage, setShowSuccessMessage] =
        useState<boolean>(false);
    const [showTransactionAlreadyPaidFor, setShowTransactionAlreadyPaidFor] =
        useState<boolean>(false);
    const [showPaymentCancelled, setShowPaymentCancelled] =
        useState<boolean>(false);
    const [showPaymentFailed, setShowPaymentFailed] = useState<boolean>(false);

    const res = searchParams.get('res');

    useEffect(() => {
        try {
            if (res === null) throw new Error();
            const decodedRes: { status: string } = JSON.parse(window.atob(res));
            if (!('status' in decodedRes)) throw new Error();

            switch (decodedRes.status) {
                case 'success':
                    setShowSuccessMessage(true);
                    break;
                case 'already paid':
                    setShowTransactionAlreadyPaidFor(true);
                    break;
                case 'cancel':
                    setShowPaymentCancelled(true);
                    break;
                case 'failure':
                    setShowPaymentFailed(true);
                    break;
            }
        } catch (e) {
            return navigate('/');
        }
    }, [res]);

    let render = <SuccessMessage />;
    if (showTransactionAlreadyPaidFor)
        render = <TransactionAlreadyPaidForError />;
    else if (showPaymentCancelled) render = <PaymentCancelledError />;
    else if (showPaymentFailed) render = <PaymentFailedError />;

    return render;
};

export default FundraisingCampaignCallback;
