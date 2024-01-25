import { FC } from 'react';

import Modal from '../../../../components/UI/Modal/Modal';
import Button from '../../../../components/UI/Button/Button';

interface SuccessModalProps {
    onClose: () => void;
}

const SuccessModal: FC<SuccessModalProps> = (props) => {
    return (
        <Modal
            title="Success"
            message={<p>The product reivew has been added successfully.</p>}
            onClose={props.onClose}
            includeCancelButton={false}
            actions={<Button onClick={props.onClose}>OK</Button>}
        />
    );
};

export default SuccessModal;
