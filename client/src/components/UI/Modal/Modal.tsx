import { FC, Fragment, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';
import classNames from 'classnames';

import Backdrop from '../Backdrop/Backdrop';
import Button from '../Button/Button';
import Card from '../Card/Card';
import classes from './Modal.module.css';

interface ModalProps {
    title?: string;
    // the main body of the modal window
    message: JSX.Element;
    // cancel button is included by default, this is used to add more buttons
    // use it like this:
    /*
        actions={
            <Fragment>
                <button>Send</button>
                <button>Terminate</button> 
                ...
            </Fragment>
        }
    */
    actions?: JSX.Element;
    onClose: () => void;
    includeCancelButton?: boolean;
    // this class will be added to the div block with class = 'modal__actions'
    modalActionsClassName?: string;
}

const Modal: FC<ModalProps> = ({ includeCancelButton = true, ...props }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const refCurrent = modalRef.current;
        if (!refCurrent) return;

        disableBodyScroll(refCurrent);
        return () => enableBodyScroll(refCurrent);
    }, [modalRef]);

    return createPortal(
        <Fragment>
            <Backdrop onClick={props.onClose} />
            <Card className={classes.modal} ref={modalRef}>
                {/* if props.title is defined and its length is bigger than 0 */}
                {props.title?.length && (
                    <div className={classes['modal__header']}>
                        <h2 className={classes['modal-header__title']}>
                            {props.title}
                        </h2>
                    </div>
                )}
                <div className={classes['modal__body']}>{props.message}</div>
                {includeCancelButton || props.actions ? (
                    <div
                        className={classNames(
                            classes['modal__actions'],
                            props.modalActionsClassName
                        )}
                    >
                        {includeCancelButton && (
                            <Button
                                className={
                                    classes['modal-actions__cancel-button']
                                }
                                onClick={props.onClose}
                            >
                                Cancel
                            </Button>
                        )}
                        {props.actions}
                    </div>
                ) : null}
            </Card>
        </Fragment>,
        document.getElementById('modal-window')!
    );
};

export default Modal;
