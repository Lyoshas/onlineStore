import { FC, useEffect } from 'react';
import ReactDOM from 'react-dom';

import classes from './ErrorNotification.module.css';
import getStaticAssetUrl from '../../../util/getStaticAssetUrl';

const ErrorNotification: FC<{ message: string; onClose: () => void }> = (
    props
) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            props.onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return ReactDOM.createPortal(
        <div className={classes['error-notification']} onClick={props.onClose}>
            <div className={classes['error-wrapper']}>
                <div className={classes['error__flex-container']}>
                    <img
                        src={getStaticAssetUrl('error-icon.png')}
                        className={classes['error__icon']}
                    />
                    <span>{props.message}</span>
                </div>
                <div className={classes['error__progress-bar']}>
                    <div className={classes['progress-bar__inner']}></div>
                </div>
            </div>
        </div>,
        document.getElementById('error-container') as HTMLElement
    );
};

export default ErrorNotification;
