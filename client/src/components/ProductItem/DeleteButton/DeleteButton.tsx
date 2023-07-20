import { FC, Fragment, useState, useEffect, useCallback } from 'react';
import { enableBodyScroll, disableBodyScroll } from 'body-scroll-lock';
import { useMutation } from '@apollo/client';
import classNames from 'classnames';

import Button from '../../UI/Button/Button';
import classes from './DeleteButton.module.css';
import DELETE_PRODUCT from './GraphQL/deleteProduct';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import SuccessModal from './SuccessModal/SuccessModal';
import ErrorModal from './ErrorModal/ErrorModal';
import Loading from '../../UI/Loading/Loading';
import apolloClient from '../../../graphql/client';
import GET_FEATURED_PRODUCTS from '../../ExploreProductsBlock/GraphQL/getFeaturedProducts';

interface DeleteButtonProps {
    productId: number;
    productTitle: string;
    className: string;
}

const DeleteButton: FC<DeleteButtonProps> = ({
    productId,
    productTitle,
    className,
}) => {
    const [showConfirmationModal, setShowConfirmationModal] =
        useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
    const [modalElement, setModalElement] = useState<HTMLDivElement | null>(
        null
    );

    // when a modal is rendered, this function will automatically disable scrolling
    const modalRef = useCallback((modalNode: HTMLDivElement | null) => {
        if (!modalNode) return;
        disableBodyScroll(modalNode);
        setModalElement(modalNode);
    }, []);

    const [
        deleteProduct,
        {
            loading: isProductDeleting,
            error: responseError,
            data: responseData,
        },
    ] = useMutation(DELETE_PRODUCT);

    useEffect(() => {
        if (responseError) setShowErrorModal(true);
    }, [responseError]);

    useEffect(() => {
        // if the product hasn't been deleted yet, skip the execution
        if (!responseData) return;

        // after the product has been successfully deleted it's important to refetch GET_FEATURED_PRODUCTS
        // changing the cache directly wouldn't do much good because in this case it would lack 1 product
        setShowSuccessModal(true);
    }, [responseData]);

    useEffect(() => {
        // if any modal window is shown, skip the execution
        if (!modalElement) return;
        // if we specified that at least one modal window needs to be shown, skip the execution
        if (showConfirmationModal || showSuccessModal || showErrorModal) return;

        enableBodyScroll(modalElement);
    }, [modalElement, showConfirmationModal, showSuccessModal, showErrorModal]);

    const handleModalClose = () => {
        setShowConfirmationModal(false);
        setShowSuccessModal(false);
        setShowErrorModal(false);
    };

    const handleButtonClick = () => {
        setShowConfirmationModal(true);
    };

    const handleProductDelete = () => {
        setShowConfirmationModal(false);
        deleteProduct({ variables: { deleteProductId: productId } });
    };

    const handleSuccessModalClose = () => {
        handleModalClose();

        // after the product has been successfully deleted it's important to refetch GET_FEATURED_PRODUCTS
        // changing the cache directly wouldn't do much good because in this case it would lack 1 product
        apolloClient.refetchQueries({
            include: [GET_FEATURED_PRODUCTS],
        });
    };

    return (
        <Fragment>
            {showConfirmationModal && (
                <ConfirmationModal
                    productTitle={productTitle}
                    onDeleteProduct={handleProductDelete}
                    onModalClose={handleModalClose}
                    ref={modalRef}
                />
            )}
            {/* if there is data, it means the delete request was successful */}
            {showSuccessModal && responseData && (
                <SuccessModal
                    onClose={handleSuccessModalClose}
                    ref={modalRef}
                />
            )}
            {showErrorModal && responseError && (
                <ErrorModal
                    title="Error while deleting the product"
                    errorMessage={responseError.message}
                    onClose={handleModalClose}
                    ref={modalRef}
                />
            )}
            <Button
                // if the product is being deleted, don't allow to click this button again
                onClick={isProductDeleting ? function () {} : handleButtonClick}
                className={classNames(
                    classes['product-delete-button'],
                    className
                )}
            >
                {isProductDeleting ? (
                    <Loading width="20px" height="20px" />
                ) : (
                    'Delete'
                )}
            </Button>
        </Fragment>
    );
};

export default DeleteButton;
