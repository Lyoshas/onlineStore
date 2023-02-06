import { FC } from 'react';

import classes from './SuccessfulMessage.module.css';

const SuccessfulSignupMessage: FC = () => {
    return (
        <div className={classes['success-message-block']}>
            <img src="/success-icon.svg" alt="Success" />
            <p className={classes['success-message__text']}>
                You've successfully signed up! Please check your email for
                futher instructions.
                <br />
                <b>Please check your "spam" folder as well!</b>
            </p>
        </div>
    );
};

export default SuccessfulSignupMessage;
