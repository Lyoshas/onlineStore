import { Formik } from 'formik';
import { FC } from 'react';

import validationSchema from './schema/add-review-schema';
import Modal from '../../../../components/UI/Modal/Modal';
import classes from './AddReviewModal.module.css';
import StarRatingForm from './StarRatingForm/StarRatingForm';
import ErrorMessage from '../../../../components/UI/ErrorMessage/ErrorMessage';
import SubmitButton from '../../../../components/UI/SubmitButton/SubmitButton';

const AddReviewModal: FC<{
    isReviewBeingAdded: boolean;
    addProductReviewToAPI: (reviewMessage: string, starRating: number) => void;
    hideModal: () => void;
}> = (props) => {
    return (
        <Formik
            initialValues={{
                starRating: 0,
                reviewMessage: '',
            }}
            validationSchema={validationSchema}
            validateOnBlur={true}
            validateOnChange={true}
            onSubmit={(values) => {
                props.addProductReviewToAPI(
                    values.reviewMessage,
                    values.starRating
                );
            }}
        >
            {(formik) => (
                <Modal
                    title={'Add a new review'}
                    message={
                        <div className={classes['product-review']}>
                            <StarRatingForm />
                            {formik.getFieldMeta('starRating').touched &&
                                formik.errors.starRating && (
                                    <ErrorMessage
                                        className={
                                            classes[
                                                'product-review__error-message'
                                            ]
                                        }
                                    >
                                        {formik.errors.starRating}
                                    </ErrorMessage>
                                )}
                            <textarea
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                name="reviewMessage"
                                className={
                                    classes['product-review__review-message']
                                }
                                placeholder="Enter your review here..."
                            />
                            {formik.getFieldMeta('reviewMessage').touched &&
                                formik.errors.reviewMessage && (
                                    <ErrorMessage
                                        className={
                                            classes[
                                                'product-review__error-message'
                                            ]
                                        }
                                    >
                                        {formik.errors.reviewMessage}
                                    </ErrorMessage>
                                )}
                        </div>
                    }
                    onClose={props.hideModal}
                    actions={
                        <SubmitButton
                            label="Send"
                            isLoading={props.isReviewBeingAdded}
                            onClick={formik.submitForm}
                        />
                    }
                />
            )}
        </Formik>
    );
};

export default AddReviewModal;
