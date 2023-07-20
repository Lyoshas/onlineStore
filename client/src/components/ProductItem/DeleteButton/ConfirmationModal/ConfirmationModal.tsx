import { FC, Fragment, RefObject, forwardRef } from 'react';

import Modal from '../../../UI/Modal/Modal';
import Button from '../../../UI/Button/Button';

interface ConfirmationModalProps {
    productTitle: string;
    onDeleteProduct: () => void;
    onModalClose: () => void;
}

const ConfirmationModal = forwardRef<HTMLDivElement, ConfirmationModalProps>(
    ({ onDeleteProduct, onModalClose, productTitle }, ref) => {
        return (
            <Modal
                title="Confirmation"
                message={
                    <p>
                        Are you sure you want to delete the product with the
                        title
                        <br />"{productTitle}"?
                    </p>
                }
                actions={
                    <Fragment>
                        <Button onClick={onDeleteProduct}>Delete</Button>
                    </Fragment>
                }
                onClose={onModalClose}
                ref={ref}
            />
        );
    }
);

export default ConfirmationModal;
