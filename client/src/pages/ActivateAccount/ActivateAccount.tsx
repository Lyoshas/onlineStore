import { FC, Fragment, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import classes from './ActivateAccount.module.css';
import Loading from '../../components/UI/Loading/Loading';
import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';
import { errorActions } from '../../store/slices/error';
import { useActivateAccountMutation } from '../../store/apis/authApi';
import SuccessIcon from '../../components/UI/Icons/SuccessIcon';
import ErrorIcon from '../../components/UI/Icons/ErrorIcon';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';

const ActivateAccount: FC = () => {
    const dispatch = useDispatch();
    const { activationToken } = useParams<{ activationToken: string }>();
    const [
        activateAccount,
        { isError, isLoading, isSuccess, isUninitialized, error },
    ] = useActivateAccountMutation();

    useEffect(() => {
        activateAccount(activationToken!);
    }, [activationToken]);

    useEffect(() => {
        if (!isError) return;

        // if this is not a server error OR the status code is less than 500, return
        if (!error || !('data' in error) || error.status < 500) return;

        dispatch(
            errorActions.showNotificationError(
                'Something went wrong. Please reload the page.'
            )
        );
    }, [isError, error]);

    let message: string;

    if (isError) {
        interface ServerErrorResponse {
            errors: {
                message: string;
                field?: string;
            }[];
        }

        // if error is of type FetchBaseQueryError (from RTK Query)
        if ('data' in error! && !('originalStatus' in error)) {
            // take the message that the server has sent
            message = (error.data as ServerErrorResponse).errors[0].message;
        } else {
            message = 'Something went wrong';
        }
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
