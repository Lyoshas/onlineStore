import { FC } from 'react';

import Modal from '../../../UI/Modal/Modal';
import Button from '../../../UI/Button/Button';

interface ErrorModalProps {
    title: string;
    errorMessage: string;
    onClose: () => void;
}

const ErrorModal: FC<ErrorModalProps> = (props) => {
    return (
        <Modal
            title={props.title}
            message={<p>{props.errorMessage}</p>}
            onClose={props.onClose}
            includeCancelButton={false}
            actions={<Button onClick={props.onClose}>OK</Button>}
        />
    );
};

export default ErrorModal;
