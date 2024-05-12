import { Fragment } from 'react';

import SuccessMessageBlock from '../../components/UI/SuccessMessageBlock/SuccessMessageBlock';
import classes from './SuccessMessage.module.css';

const SuccessMessage = () => {
    return (
        <SuccessMessageBlock
            className={classes['success-block']}
            content={
                <Fragment>
                    <p>Посилання надіслано на вашу електронну пошту.</p>
                    <b>Будь ласка, перевірте також папку «спам»!</b>
                </Fragment>
            }
        />
    );
};

export default SuccessMessage;
