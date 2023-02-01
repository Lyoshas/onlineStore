import { FC, Fragment } from 'react';

import classes from './SuccessfulMessage.module.css';

const SuccessfulSignupMessage: FC = () => {
    return (
        <Fragment>
            <p className={classes['success-message']}>
                You've successfully signed up! Please check your email for
                futher instructions.
                <br />
                <b>Please check your "spam" folder as well!</b>
            </p>
        </Fragment>
    );
};

export default SuccessfulSignupMessage;
