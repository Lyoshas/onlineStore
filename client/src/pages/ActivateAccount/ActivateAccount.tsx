import { FC, Fragment, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import classes from './ActivateAccount.module.css';
import Loading from '../../components/UI/Loading/Loading';
import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';
import { useActivateAccountMutation } from '../../store/apis/authApi';
import SuccessIcon from '../../components/UI/Icons/SuccessIcon';
import ErrorIcon from '../../components/UI/Icons/ErrorIcon';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import useApiError from '../../components/hooks/useApiError';

const ActivateAccount: FC = () => {
    const { activationToken } = useParams<{ activationToken: string }>();
    const [
        activateAccount,
        { isError, isLoading, isSuccess, isUninitialized, error },
    ] = useActivateAccountMutation();
    // if any server-side error occurs (the status code is >= 400),
    // the "something went wrong" message will be shown by the custom hook
    const expectedErrorResponse = useApiError(isError, error, []);

    useEffect(() => {
        activateAccount(activationToken!);
    }, [activationToken]);

    let message: string;

    if (expectedErrorResponse !== null) {
        message = expectedErrorResponse.serverResponse.errors[0].message;
    } else if (isError) {
        message = 'Something went wrong';
    } else {
        message = 'The account has been activated';
    }

    return (
        <CenterBlock className={classes['activation-block']}>
            {isUninitialized || (isLoading && <Loading color="#273c99" />)}
            {!isUninitialized && !isLoading && (
                <Fragment>
                    {isSuccess ? (
                        <SuccessIcon className={classes.icon} />
                    ) : (
                        <ErrorIcon className={classes.icon} />
                    )}
                    <p className={classes.message}>{message}</p>
                    <ButtonLink to={`${isSuccess ? '/auth/sign-in' : '/'}`}>
                        {isSuccess ? 'Sign In' : 'Home Page'}
                    </ButtonLink>
                </Fragment>
            )}
        </CenterBlock>
    );
};

export default ActivateAccount;
