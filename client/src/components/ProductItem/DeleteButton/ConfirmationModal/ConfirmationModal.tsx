import { FC, Fragment } from 'react';

import Modal from '../../../UI/Modal/Modal';
import Button from '../../../UI/Button/Button';

interface ConfirmationModalProps {
    productTitle: string;
    onDeleteProduct: () => void;
    onModalClose: () => void;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
    onDeleteProduct,
    onModalClose,
    productTitle,
}) => {
    return (
        <Modal
            title="Confirmation"
            message={
                <p>
                    Are you sure you want to delete the product with the title
                    <br />"{productTitle}"?
                </p>
            }
            actions={
                <Fragment>
                    <Button onClick={onDeleteProduct}>Delete</Button>
                </Fragment>
            }
            onClose={onModalClose}
        />
    );
};

export default ConfirmationModal;
