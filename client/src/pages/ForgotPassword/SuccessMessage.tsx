import { Fragment } from 'react';

import SuccessMessageBlock from '../../components/UI/SuccessMessageBlock/SuccessMessageBlock';
import classes from './SuccessMessage.module.css';

const SuccessMessage = () => {
    return (
        <SuccessMessageBlock
            className={classes['success-block']}
            content={
                <Fragment>
                    <p>The link has been sent to your email.</p>
                    <b>Please check the "spam" folder as well!</b>
                </Fragment>
            }
        />
    );
};

export default SuccessMessage;
