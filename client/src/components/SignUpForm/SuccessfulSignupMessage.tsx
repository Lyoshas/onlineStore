import { FC } from 'react';

import classes from './SuccessfulMessage.module.css';
import SuccessIcon from '../UI/Icons/SuccessIcon';

const SuccessfulSignupMessage: FC = () => {
    return (
        <div className={classes['success-message-block']}>
            <SuccessIcon />
            <p className={classes['success-message__text']}>
                Ви успішно зареєструвалися! Будь ласка, перевірте свою
                електронну пошту для отримання подальших інструкцій.
                <br />
                <b>Будь ласка, перевірте також папку «спам»!</b>
            </p>
        </div>
    );
};

export default SuccessfulSignupMessage;
