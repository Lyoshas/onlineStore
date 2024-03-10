import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFormikContext } from 'formik';
import isEmail from 'validator/lib/isEmail';

import { useLazyIsEmailAvailableQuery } from '../../../../store/apis/authApi';
import FormInput from '../../../../components/Input/FormInput';
import useApiError from '../../../../components/hooks/useApiError';
import { errorActions } from '../../../../store/slices/error';
import useDebounce from '../../../../components/hooks/useDebounce';
import CheckoutInitialValues from '../../interfaces/CheckoutInitialValues';

const EmailInput = () => {
    const { setFieldError, values: formikValues } =
        useFormikContext<CheckoutInitialValues>();
    const dispatch = useDispatch();
    const [
        isEmailAvailable,
        {
            isFetching: isCheckingEmail,
            isError: isCheckingEmailError,
            error: checkingEmailError,
            data: emailCheckResult,
        },
    ] = useLazyIsEmailAvailableQuery();
    const serverErrorResponse = useApiError(
        isCheckingEmailError,
        checkingEmailError,
        [503]
    );

    useEffect(() => {
        // including 'isCheckingEmail' to prevent bugs when this useEffect isn't executed
        if (isCheckingEmail) return;

        if (emailCheckResult) {
            setFieldError('additionalEmailError', undefined);
        }

        if (emailCheckResult?.isEmailAvailable) {
            setFieldError('email', undefined);
            return;
        }

        if (emailCheckResult && !emailCheckResult.isEmailAvailable) {
            setFieldError('email', 'Email is already in use');
            return;
        }
    }, [isCheckingEmail, emailCheckResult, setFieldError]);

    useEffect(() => {
        if (serverErrorResponse && serverErrorResponse.statusCode === 503) {
            dispatch(
                errorActions.showNotificationError(
                    'Wow, slow down! Too many requests!'
                )
            );
        }
    }, [serverErrorResponse]);
    const {
        debouncedFunction: debouncedIsEmailAvailable,
        isActionExecuting: isValidatingEmail,
    } = useDebounce(isEmailAvailable, 1000, true);

    const onValueChanged = useCallback(
        (newValue: string) => {
            if (!isEmail(newValue)) return;
            // setting the 'additionalEmailError' field instead of 'email' because the 'email' field errors would be immediately overridden
            setFieldError(
                'additionalEmailError',
                "Email's validity hasn't been checked yet. Please wait..."
            );
            debouncedIsEmailAvailable({ email: newValue });
        },
        [debouncedIsEmailAvailable, setFieldError]
    );

    return (
        <FormInput
            type="email"
            label="Email"
            isRequired={true}
            name="email"
            considerAdditionalErrorFields={['additionalEmailError']}
            placeholder="Enter your email"
            validateOnChange={true}
            validateOnBlur={false}
            onValueChanged={onValueChanged}
            value={formikValues.email}
        />
    );
};

export default EmailInput;
