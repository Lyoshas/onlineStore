import { FC, Fragment, useCallback, useRef, useState } from 'react';
import classNames from 'classnames';

import Modal from '../../UI/Modal/Modal';
import formInputClasses from '../../Input/FormInput.module.css';
import Button from '../../UI/Button/Button';
import classes from './DonationModal.module.css';
import ErrorMessage from '../../UI/ErrorMessage/ErrorMessage';

const DonationModal: FC<{
    onClose: () => void;
}> = (props) => {
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const inputChangeHandler = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            const isDataInvalid = value === '' || +value < 100;
            setButtonDisabled(isDataInvalid);
            setIsError(isDataInvalid);
        },
        [setButtonDisabled, setIsError]
    );

    const handleProceed = useCallback(() => {
        if (inputRef.current === null) return;
        const currentValue = inputRef.current.value;
        console.log('sending a request...');
        console.log(currentValue);
    }, [inputRef.current]);

    return (
        <Modal
            title="Donation"
            message={
                <Fragment>
                    <p>Enter the amount you wish to donate</p>
                    <input
                        type="number"
                        className={classNames(
                            formInputClasses['form-input'],
                            classes['campaign-modal__donation-input']
                        )}
                        min="0"
                        step="0.01"
                        placeholder="Amount (UAH)"
                        onChange={inputChangeHandler}
                        ref={inputRef}
                    />
                    {isError && (
                        <ErrorMessage
                            className={classes['campaign-modal__error-message']}
                        >
                            The minimum donation is 100 UAH
                        </ErrorMessage>
                    )}
                </Fragment>
            }
            actions={
                <Button disabled={buttonDisabled} onClick={handleProceed}>
                    Proceed
                </Button>
            }
            onClose={props.onClose}
        />
    );
};

export default DonationModal;
