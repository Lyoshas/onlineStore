import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ErrorMessageBlock from '../../components/UI/ErrorMessageBlock/ErrorMessageBlock';
import LoadingScreen from '../../components/UI/LoadingScreen/LoadingScreen';
import SuccessMessage from '../Checkout/SuccessMessage/SuccessMessage';

const CallbackSuccessMessage = () => {
    const [showEmailNotice, setShowEmailNotice] = useState<boolean>(
        localStorage.getItem('orderWithNoAuth') === 'true'
    );

    useEffect(() => {
        localStorage.removeItem('orderWithNoAuth');
    }, []);

    return (
        <SuccessMessage
            showEmailNotice={showEmailNotice}
            mode="PaymentProcessed"
        />
    );
};

const OrderAlreadyPaidForError = () => {
    return <ErrorMessageBlock message="The order has already been paid for." />;
};

const PaymentCancelled = () => {
    return (
        <ErrorMessageBlock message="The payment has been canceled, resulting in the cancellation of the order. Please place a new order to retry." />
    );
};

const PaymentFailed = () => {
    return (
        <ErrorMessageBlock message="Something went wrong while paying for the order, resulting in the cancellation of the order. Please place a new order to retry." />
    );
};

const OrderCallback = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showSuccessMessage, setShowSuccessMessage] =
        useState<boolean>(false);
    const [showOrderAlreadyPaidFor, setShowOrderAlreadyPaidFor] =
        useState<boolean>(false);
    const [showPaymentCancelled, setShowPaymentCancelled] =
        useState<boolean>(false);
    const [showPaymentFailed, setShowPaymentFailed] = useState<boolean>(false);

    useEffect(() => {
        const paymentStatus = searchParams.get('res');
        if (paymentStatus === null) return navigate('/');

        try {
            // "paymentStatus" is supposed to be a base64 encoded string
            // the "atob" function decodes base64 data
            const plaintext: string = window.atob(paymentStatus);
            const decodedObject = JSON.parse(plaintext);
            if (!('status' in decodedObject)) throw new Error();
            switch (decodedObject.status) {
                case 'success':
                    setShowSuccessMessage(true);
                    break;
                case 'already paid':
                    setShowOrderAlreadyPaidFor(true);
                    break;
                case 'cancel':
                    setShowPaymentCancelled(true);
                    break;
                case 'failure':
                    setShowPaymentFailed(true);
                    break;
            }
        } catch (e) {
            // if "paymentStatus" is NOT base64 encoded or it holds incorrect data,
            // redirect to the main page
            navigate('/');
        }
    }, [searchParams, navigate]);

    let render: JSX.Element = <LoadingScreen />;

    if (showSuccessMessage) render = <CallbackSuccessMessage />;
    else if (showOrderAlreadyPaidFor) render = <OrderAlreadyPaidForError />;
    else if (showPaymentCancelled) render = <PaymentCancelled />;
    else if (showPaymentFailed) render = <PaymentFailed />;

    return render;
};

export default OrderCallback;
