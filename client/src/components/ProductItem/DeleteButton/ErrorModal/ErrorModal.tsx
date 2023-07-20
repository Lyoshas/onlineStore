import { forwardRef } from 'react';

import Modal from '../../../UI/Modal/Modal';
import Button from '../../../UI/Button/Button';

interface ErrorModalProps {
    title: string;
    errorMessage: string;
    onClose: () => void;
}

const ErrorModal = forwardRef<HTMLDivElement, ErrorModalProps>((props, ref) => {
    return (
        <Modal
            title={props.title}
            message={<p>{props.errorMessage}</p>}
            onClose={props.onClose}
            includeCancelButton={false}
            actions={<Button onClick={props.onClose}>OK</Button>}
            ref={ref}
        />
    );
});

export default ErrorModal;
