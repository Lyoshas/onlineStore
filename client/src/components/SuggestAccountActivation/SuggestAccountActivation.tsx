import { Form, Formik } from 'formik';
import { FC, Fragment, useEffect, useReducer, useState } from 'react';
import * as Yup from 'yup';

import useFetch from '../hooks/useFetch';
import Button from '../UI/Button/Button';
import Modal from '../UI/Modal/Modal';
import classes from './SuggestAccountActivation.module.css';
import ReCAPTCHABlock from '../ReCAPTCHABlock/ReCAPTCHABlock';
import SubmitButton from '../UI/SubmitButton/SubmitButton';
import ErrorNotification, {
    ErrorActionType,
    errorNotificationReducer,
} from '../UI/ErrorNotification/ErrorNotification';

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
    const [modalState, dispatchModal] = useReducer(modalReducer, {
        isModalShown: false,
        isActivationModalShown: false,
        isSuccessModalShown: false,
    });
    const [errorState, dispatchError] = useReducer(errorNotificationReducer, {
        isErrorNotificationShown: false,
        errorMessage: '',
    });
    const {
        statusCode,
        isRequestLoading,
        sendRequest,
        JSONResponse,
        unexpectedRequestError,
        wasRequestSuccessful,
        requestTimestamp
    } = useFetch(
        '/api/auth/resend-activation-link',
        {
            method: 'POST',
        },
        200
    );

    useEffect(() => {
        if (wasRequestSuccessful === null) return;

        if (wasRequestSuccessful) {
            dispatchModal({ type: ModalAction.SHOW_SUCCESS_MODAL });
            return;
        }

        dispatchError({
            type: ErrorActionType.SHOW_NOTIFICATION_ERROR,
            errorMessage:
                statusCode === 409
                    ? 'Your account is already activated'
                    : 'Something went wrong. We are working on solving this problem. Please try reloading the page.',
        });
    }, [wasRequestSuccessful, requestTimestamp]);

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

                await sendRequest({
                    login: props.login,
                    password: props.password,
                    recaptchaToken: values.recaptchaToken,
                });

                setSubmitting(false);
            }}
        >
            {(formik) => (
                <Form>
                    {errorState.isErrorNotificationShown && (
                        <ErrorNotification
                            message={errorState.errorMessage}
                            onClose={() =>
                                dispatchError({
                                    type: ErrorActionType.HIDE_ERROR,
                                })
                            }
                        />
                    )}
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
                                            <b>{JSONResponse.targetEmail}</b>)
                                            for further instructions.
                                        </p>
                                    )}
                                </Fragment>
                            }
                            actions={
                                modalState.isActivationModalShown ? (
                                    <SubmitButton
                                        label="Send"
                                        isLoading={isRequestLoading}
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
