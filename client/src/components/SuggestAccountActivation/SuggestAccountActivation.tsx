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
import useApiError from '../hooks/useApiError';

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
    const expectedErrorResponse = useApiError(isError, error, [409]);

    const statusCode =
        expectedErrorResponse && expectedErrorResponse.statusCode;

    useEffect(() => {
        if (isSuccess) {
            dispatchModal({ type: ModalAction.SHOW_SUCCESS_MODAL });
            return;
        }

        if (statusCode !== 409) return;

        dispatch(
            errorActions.showNotificationError('Ваш акаунт вже активований')
        );
    }, [data, isSuccess, statusCode]);

    return (
        <Formik
            initialValues={{ recaptchaToken: '' }}
            validationSchema={Yup.object().shape({
                recaptchaToken: Yup.string().required(
                    'Необхідна верифікація за допомогою капчі'
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
                            title="Надіслати посилання для активації ще раз"
                            message={
                                <Fragment>
                                    {modalState.isActivationModalShown && (
                                        <Fragment>
                                            <p>
                                                Ви впевнені, що хочете повторно
                                                надіслати посилання на
                                                електронну пошту, пов'язану з
                                                цим логіном?{' '}
                                                <b>"{props.login}"</b>?
                                            </p>
                                            <ReCAPTCHABlock />
                                        </Fragment>
                                    )}
                                    {modalState.isSuccessModalShown && (
                                        <p>
                                            Перевірте вашу пошту (
                                            <b>{data!.targetEmail}</b>) для
                                            отримання подальших інструкцій.
                                        </p>
                                    )}
                                </Fragment>
                            }
                            actions={
                                modalState.isActivationModalShown ? (
                                    <SubmitButton
                                        label="Надіслати"
                                        isLoading={isLoading}
                                        onClick={() => formik.submitForm()}
                                    />
                                ) : (
                                    <Fragment />
                                )
                            }
                            onClose={() => {
                                dispatchModal({
                                    type: ModalAction.HIDE_MODALS,
                                });
                                formik.resetForm();
                            }}
                        />
                    )}
                    <p className={classes['suggestion-paragraph']}>
                        Чи хотіли б ви{' '}
                        <Button
                            onClick={() =>
                                dispatchModal({
                                    type: ModalAction.SHOW_ACTIVATION_MODAL,
                                })
                            }
                        >
                            надіслати посилання
                        </Button>
                        {' '}ще раз?
                    </p>
                </Form>
            )}
        </Formik>
    );
};

export default SuggestAccountActivation;
