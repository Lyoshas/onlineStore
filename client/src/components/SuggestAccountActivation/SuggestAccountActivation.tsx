import { Form, Formik } from 'formik';
import { FC, Fragment, useEffect, useReducer } from 'react';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';

import Button from '../UI/Button/Button';
import Modal from '../UI/Modal/Modal';
import classes from './SuggestAccountActivation.module.css';
import ReCAPTCHABlock from '../ReCAPTCHABlock/ReCAPTCHABlock';
import SubmitButton from '../UI/SubmitButton/SubmitButton';
import { errorActions } from '../../store/slices/error';
import { useResendActivationLinkMutation } from '../../store/apis/authApi';
import deriveStatusCode from '../../util/deriveStatusCode';

interface ModalState {
    isModalShown: boolean;
    isActivationModalShown: boolean;
    isSuccessModalShown: boolean;
}

enum ModalAction {
    SHOW_ACTIVATION_MODAL,
    SHOW_SUCCESS_MODAL,
    HIDE_MODALS,
}

interface DispatchAction {
    type: ModalAction;
}

const modalReducer = (
    prevState: ModalState,
    action: DispatchAction
): ModalState => {
    switch (action.type) {
        case ModalAction.SHOW_ACTIVATION_MODAL:
            return {
                isModalShown: true,
                isActivationModalShown: true,
                isSuccessModalShown: false,
            };
        case ModalAction.SHOW_SUCCESS_MODAL:
            return {
                isModalShown: true,
                isActivationModalShown: false,
                isSuccessModalShown: true,
            };
        case ModalAction.HIDE_MODALS:
            return {
                isModalShown: false,
                isActivationModalShown: false,
                isSuccessModalShown: false,
            };
    }
};

const SuggestAccountActivation: FC<{ login: string; password: string }> = (
    props
) => {
    const dispatch = useDispatch();
    const [modalState, dispatchModal] = useReducer(modalReducer, {
        isModalShown: false,
        isActivationModalShown: false,
        isSuccessModalShown: false,
    });
    const [
        resendActivationLink,
        { isSuccess, data, isError, error, isLoading },
    ] = useResendActivationLinkMutation();

    const statusCode = deriveStatusCode(error);

    useEffect(() => {
        if (!isError) return;
        if (typeof statusCode === 'number' && statusCode < 500) return;

        dispatch(
            errorActions.showNotificationError(
                'Something went wrong while sending the link. Please reload the page.'
            )
        );
    }, [isError, statusCode]);

    useEffect(() => {
        if (!data) return;
        if (isSuccess) {
            dispatchModal({ type: ModalAction.SHOW_SUCCESS_MODAL });
            return;
        }

        dispatch(
            errorActions.showNotificationError(
                statusCode === 409
                    ? 'Your account is already activated'
                    : 'Something went wrong. We are working on solving this problem. Please try reloading the page.'
            )
        );
    }, [data, isSuccess, statusCode]);

    return (
        <Formik
            initialValues={{ recaptchaToken: '' }}
            validationSchema={Yup.object().shape({
                recaptchaToken: Yup.string().required(
                    'Captcha verification is required'
                ),
            })}
            onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);

                await resendActivationLink({
                    login: props.login,
                    password: props.password,
                    recaptchaToken: values.recaptchaToken,
                });

                setSubmitting(false);
            }}
        >
            {(formik) => (
                <Form>
                    {modalState.isModalShown && (
                        <Modal
                            title="Resend the activation link"
                            message={
                                <Fragment>
                                    {modalState.isActivationModalShown && (
                                        <Fragment>
                                            <p>
                                                Are you sure you want to resend
                                                the link to the email associated
                                                with this login:{' '}
                                                <b>"{props.login}"</b>?
                                            </p>
                                            <ReCAPTCHABlock />
                                        </Fragment>
                                    )}
                                    {modalState.isSuccessModalShown && (
                                        <p>
                                            Please check your email (
                                            <b>{data!.targetEmail}</b>) for
                                            further instructions.
                                        </p>
                                    )}
                                </Fragment>
                            }
                            actions={
                                modalState.isActivationModalShown ? (
                                    <SubmitButton
                                        label="Send"
                                        isLoading={isLoading}
                                        onClick={() => formik.submitForm()}
                                    />
                                ) : (
                                    <Fragment />
                                )
                            }
                            onClose={() =>
                                dispatchModal({ type: ModalAction.HIDE_MODALS })
                            }
                        />
                    )}
                    <p className={classes['suggestion-paragraph']}>
                        Would you like to{' '}
                        <Button
                            onClick={() =>
                                dispatchModal({
                                    type: ModalAction.SHOW_ACTIVATION_MODAL,
                                })
                            }
                        >
                            resend the link
                        </Button>
                        ?
                    </p>
                </Form>
            )}
        </Formik>
    );
};

export default SuggestAccountActivation;
