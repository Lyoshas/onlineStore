import { forwardRef } from 'react';

import Modal from '../../../UI/Modal/Modal';
import Button from '../../../UI/Button/Button';

interface SuccessModalProps {
    onClose: () => void;
}

const SuccessModal = forwardRef<HTMLDivElement, SuccessModalProps>(
    (props, ref) => {
        return (
            <Modal
                title="Success"
                message={<p>The product has been successfully deleted.</p>}
                onClose={props.onClose}
                includeCancelButton={false}
                actions={<Button onClick={props.onClose}>OK</Button>}
                ref={ref}
            />
        );
    }
);

export default SuccessModal;
