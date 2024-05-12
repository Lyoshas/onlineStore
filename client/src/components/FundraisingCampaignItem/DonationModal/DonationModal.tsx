import { FC, Fragment, useCallback, useRef, useState } from 'react';
import classNames from 'classnames';

import Modal from '../../UI/Modal/Modal';
import formInputClasses from '../../Input/FormInput.module.css';
import Button from '../../UI/Button/Button';
import classes from './DonationModal.module.css';
import ErrorMessage from '../../UI/ErrorMessage/ErrorMessage';
import { useCreatePendingTransactionMutation } from '../../../store/apis/fundraisingApi';
import Loading from '../../UI/Loading/Loading';
import RedirectToLiqpay from '../../../pages/Checkout/RedirectToLiqpay/RedirectToLiqpay';
import deriveErrorMessage from '../../../util/deriveErrorMessage';

const DonationModal: FC<{
    campaignId: number;
    onClose: () => void;
}> = (props) => {
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const [isValidationError, setIsValidationError] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [
        createPendingTransaction,
        { isLoading, isError, error, data: apiResponse },
    ] = useCreatePendingTransactionMutation();

    const inputChangeHandler = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            const isDataInvalid = value === '' || +value < 100;
            setButtonDisabled(isDataInvalid);
            setIsValidationError(isDataInvalid);
        },
        [setButtonDisabled, setIsValidationError]
    );

    const handleProceed = useCallback(() => {
        if (inputRef.current === null) return;
        createPendingTransaction({
            campaignId: props.campaignId,
            donationAmount: +inputRef.current.value,
        });
    }, [inputRef.current, createPendingTransaction, props.campaignId]);

    let render = (
        <Modal
            title="Пожертвування"
            message={
                <Fragment>
                    {isError && error && (
                        <ErrorMessage>
                            Помилка: {deriveErrorMessage(error)}
                            <br />
                            Будь ласка, перезавантажте сторінку і спробуйте ще
                            раз
                        </ErrorMessage>
                    )}
                    {!isError && (
                        <Fragment>
                            <p>Введіть суму, яку ви бажаєте внести</p>
                            <input
                                type="number"
                                className={classNames(
                                    formInputClasses['form-input'],
                                    classes['campaign-modal__donation-input']
                                )}
                                min="0"
                                step="0.01"
                                placeholder="Грошова сума (UAH)"
                                onChange={inputChangeHandler}
                                ref={inputRef}
                            />
                            {isValidationError && (
                                <ErrorMessage
                                    className={
                                        classes['campaign-modal__error-message']
                                    }
                                >
                                    Мінімальна сума внеску - 100 грн
                                </ErrorMessage>
                            )}
                        </Fragment>
                    )}
                </Fragment>
            }
            actions={
                <Button disabled={buttonDisabled} onClick={handleProceed}>
                    {isLoading ? (
                        <Loading width="20px" height="20px" />
                    ) : (
                        'Продовжити'
                    )}
                </Button>
            }
            onClose={props.onClose}
        />
    );

    if (apiResponse) {
        render = (
            <RedirectToLiqpay
                data={apiResponse.data}
                signature={apiResponse.signature}
            />
        );
    }

    return render;
};

export default DonationModal;
