import { FC, useEffect } from 'react';
import ReactDOM from 'react-dom';

import classes from './ErrorNotification.module.css';

interface ErrorState {
    isErrorNotificationShown: boolean;
    errorMessage: string;
}

export enum ErrorActionType {
    SHOW_NOTIFICATION_ERROR,
    HIDE_ERROR,
}

export interface ErrorAction {
    type: ErrorActionType;
    errorMessage?: string;
}

export function errorNotificationReducer(
    prevState: ErrorState,
    action: ErrorAction
): ErrorState {
    switch (action.type) {
        case ErrorActionType.SHOW_NOTIFICATION_ERROR:
            // if the error message is not specified
            if (action.errorMessage == null) {
                throw new Error(
                    'errorNotificationReducer: errorMessage must be specified'
                );
            }
            return {
                isErrorNotificationShown: true,
                errorMessage: action.errorMessage,
            };
        case ErrorActionType.HIDE_ERROR:
            return {
                isErrorNotificationShown: false,
                errorMessage: '',
            };
        default:
            throw new Error('errorNotificationReducer: unknown action.type');
    }
}

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
                        src="/error-icon.png"
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
