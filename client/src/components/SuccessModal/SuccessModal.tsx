import { FC } from 'react';

import Modal from '../UI/Modal/Modal';
import Button from '../UI/Button/Button';

interface SuccessModalProps {
    onClose: () => void;
    message: string;
}

const SuccessModal: FC<SuccessModalProps> = (props) => {
    return (
        <Modal
            title="Успіх"
            message={<p>{props.message}</p>}
            onClose={props.onClose}
            includeCancelButton={false}
            actions={<Button onClick={props.onClose}>OK</Button>}
        />
    );
};

export default SuccessModal;
