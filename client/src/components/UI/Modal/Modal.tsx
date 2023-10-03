import { FC, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';

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
        <Backdrop onClick={props.onClose}>
            <Card
                className={classes.modal}
                onClick={(event) => event.stopPropagation()}
                ref={modalRef}
            >
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
                    <div className={classes['modal__actions']}>
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
        </Backdrop>,
        document.getElementById('modal-window')!
    );
};

export default Modal;
