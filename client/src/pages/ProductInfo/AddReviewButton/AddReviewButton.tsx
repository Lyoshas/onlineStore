import { FC, Fragment, useCallback, useEffect, useReducer } from 'react';
import { useMutation } from '@apollo/client';

import Button from '../../../components/UI/Button/Button';
import AddReviewModal from './AddReviewModal/AddReviewModal';
import ADD_PRODUCT_REVIEW from '../../../graphql/mutations/addProductReview';
import SuccessModal from '../../../components/SuccessModal/SuccessModal';
import ErrorModal from '../../../components/ErrorModal/ErrorModal';
import apolloClient from '../../../graphql/client';

enum ModalAction {
    SHOW_ADD_REVIEW_MODAL,
    SHOW_SUCCESS_MDOAL,
    SHOW_ERROR_MODAL,
    HIDE_MODALS,
}

interface ModalState {
    isAddReviewModalShown: boolean;
    isSuccessModalShown: boolean;
    errorModal: { isShown: boolean; errorMessage?: string };
}

const modalReducer = (
    prevState: ModalState,
    action: { type: ModalAction; payload?: string }
): ModalState => {
    switch (action.type) {
        case ModalAction.SHOW_ADD_REVIEW_MODAL:
            return {
                isAddReviewModalShown: true,
                isSuccessModalShown: false,
                errorModal: { isShown: false },
            };
        case ModalAction.SHOW_SUCCESS_MDOAL:
            return {
                isAddReviewModalShown: false,
                isSuccessModalShown: true,
                errorModal: { isShown: false },
            };
        case ModalAction.SHOW_ERROR_MODAL:
            return {
                isAddReviewModalShown: false,
                isSuccessModalShown: false,
                errorModal: { isShown: true, errorMessage: action.payload! },
            };
        case ModalAction.HIDE_MODALS:
            return {
                isAddReviewModalShown: false,
                isSuccessModalShown: false,
                errorModal: { isShown: false },
            };
    }
};

const AddReviewButton: FC<{
    productId: number;
    userCanAddReview: boolean;
}> = (props) => {
    const [modalState, dispatchModal] = useReducer(modalReducer, {
        isAddReviewModalShown: false,
        isSuccessModalShown: false,
        errorModal: { isShown: false },
    });
    const [
        _addProductReview,
        { loading: isReviewBeingAdded, error: addReviewError, data },
    ] = useMutation(ADD_PRODUCT_REVIEW);

    const addProductReview = useCallback(
        (reviewMessage: string, starRating: number) => {
            _addProductReview({
                variables: {
                    productId: props.productId,
                    reviewMessage,
                    starRating,
                },
            });
        },
        [props.productId, _addProductReview]
    );

    useEffect(() => {
        if (!isReviewBeingAdded && !addReviewError && data) {
            // if the request was successful, show the success modal
            dispatchModal({ type: ModalAction.SHOW_SUCCESS_MDOAL });
            apolloClient.cache.modify({
                id: `ProductInfoWithReviews:${props.productId}`,
                fields: {
                    // the user has added a new review, so they aren't allowed to submit another review
                    // this is why we need to modify the GraphQL cache to specify that 'userCanAddReview' is false
                    userCanAddReview() {
                        return false;
                    },
                }
            })
        }
    }, [isReviewBeingAdded, addReviewError, data]);

    useEffect(() => {
        if (!addReviewError) return;
        dispatchModal({
            type: ModalAction.SHOW_ERROR_MODAL,
            payload: addReviewError.message,
        });
    }, [addReviewError]);

    const hideAllModals = useCallback(() => {
        dispatchModal({ type: ModalAction.HIDE_MODALS });
    }, [dispatchModal]);

    const showAddReviewModal = useCallback(() => {
        dispatchModal({ type: ModalAction.SHOW_ADD_REVIEW_MODAL });
    }, [dispatchModal]);

    const showDuplicateReviewError = useCallback(() => {
        dispatchModal({
            type: ModalAction.SHOW_ERROR_MODAL,
            payload: "You've already added a review to this product",
        });
    }, [dispatchModal]);

    return (
        <Fragment>
            {modalState.isAddReviewModalShown && (
                <AddReviewModal
                    isReviewBeingAdded={isReviewBeingAdded}
                    addProductReviewToAPI={addProductReview}
                    hideModal={hideAllModals}
                />
            )}
            {modalState.isSuccessModalShown && (
                <SuccessModal
                    message="We've received your review, and it's now undergoing moderation. Rest assured, we strive to maintain a fair and transparent review process. Once approved, your review will be visible for everyone."
                    onClose={hideAllModals}
                />
            )}
            {modalState.errorModal.isShown && (
                <ErrorModal
                    title="Error while adding the review"
                    errorMessage={modalState.errorModal.errorMessage!}
                    onClose={hideAllModals}
                />
            )}
            <Button
                onClick={
                    props.userCanAddReview
                        ? showAddReviewModal
                        : showDuplicateReviewError
                }
            >
                Add review
            </Button>
        </Fragment>
    );
};

export default AddReviewButton;
