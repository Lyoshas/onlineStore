import { FC, Fragment, useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';

import Button from '../../UI/Button/Button';
import classes from './DeleteButton.module.css';
import DELETE_PRODUCT from '../../../graphql/mutations/deleteProduct';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import SuccessModal from './SuccessModal/SuccessModal';
import ErrorModal from './ErrorModal/ErrorModal';
import Loading from '../../UI/Loading/Loading';
import apolloClient from '../../../graphql/client';
import { deleteProductsByPageCache } from '../../../store/util/deleteProductsByPageCache';
import { GET_FEATURED_PRODUCTS_WITH_AUTH } from '../../../graphql/queries/getFeaturedProducts';
import { cartApi } from '../../../store/apis/cartApi';

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
    const dispatch = useDispatch();

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

        setShowSuccessModal(true);

        // refetching the cart
        // if a product is deleted, there's a chance this product was in the cart, so we need to refetch it
        dispatch(cartApi.util.invalidateTags(['CartItemCount', 'GetCart']));
    }, [responseData]);

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
            include: [GET_FEATURED_PRODUCTS_WITH_AUTH],
        });
        // Deleting any cache associated with GET_PRODUCTS_BY_PAGE. We're deleting it because it may contain the recently deleted product
        // The refetch won't happen automatically, because we don't need it
        // The refetch will only happen if it's needed (for example if a user goes to "/products?page=3")
        deleteProductsByPageCache();
    };

    return (
        <Fragment>
            {showConfirmationModal && (
                <ConfirmationModal
                    productTitle={productTitle}
                    onDeleteProduct={handleProductDelete}
                    onModalClose={handleModalClose}
                />
            )}
            {/* if there is data, it means the delete request was successful */}
            {showSuccessModal && responseData && (
                <SuccessModal onClose={handleSuccessModalClose} />
            )}
            {showErrorModal && responseError && (
                <ErrorModal
                    title="Error while deleting the product"
                    errorMessage={responseError.message}
                    onClose={handleModalClose}
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
