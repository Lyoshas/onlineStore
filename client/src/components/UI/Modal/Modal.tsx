import { FC, Fragment } from 'react';
import { createPortal } from 'react-dom';

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
}

const Modal: FC<ModalProps> = (props) => {
    return createPortal(
        <Backdrop onClick={props.onClose}>
            <Card
                className={classes.modal}
                onClick={(event) => event.stopPropagation()}
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
                <div className={classes['modal__actions']}>
                    <Button
                        className={classes['modal-actions__cancel-button']}
                        onClick={props.onClose}
                    >
                        Cancel
                    </Button>
                    {props.actions}
                </div>
            </Card>
        </Backdrop>,
        document.getElementById('modal-window')!
    );
};

export default Modal;
