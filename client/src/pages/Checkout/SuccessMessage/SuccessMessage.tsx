import { FC, Fragment } from 'react';

import SuccessMessageBlock from '../../../components/UI/SuccessMessageBlock/SuccessMessageBlock';
import ButtonLink from '../../../components/UI/ButtonLink/ButtonLink';

const SuccessMessage: FC<{
    showEmailNotice: boolean;
    mode: 'OrderCreated' | 'PaymentProcessed';
}> = (props) => {
    return (
        <SuccessMessageBlock
            content={
                <Fragment>
                    <p>
                        {props.mode === 'OrderCreated'
                            ? 'The order has been successfully created.'
                            : 'Your payment has been successfully processed.'}
                        <br />
                        Please wait for a call from a manager.
                    </p>
                    {props.showEmailNotice && (
                        <p>
                            Because the order was placed without authentication,
                            we've emailed you the login details for your newly
                            created account. The email was sent to the address
                            you provided during the order process.
                        </p>
                    )}
                    {!props.showEmailNotice ? (
                        <ButtonLink to="/orders">Order Tracking</ButtonLink>
                    ) : (
                        <ButtonLink to="/auth/sign-in">Sign In</ButtonLink>
                    )}
                </Fragment>
            }
        />
    );
};

export default SuccessMessage;
