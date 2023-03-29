import { useParams } from 'react-router-dom';
import { Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import ErrorIcon from '../../components/UI/Icons/ErrorIcon';
import Loading from '../../components/UI/Loading/Loading';
import classes from './OAuthLogin.module.css';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';
import { useGetOAuthLinkQuery } from '../../store/apis/authApi';
import deriveStatusCode from '../../util/deriveStatusCode';
import { errorActions } from '../../store/slices/error';
import ServerErrorResponse from '../../interfaces/ServerErrorResponse';

const OAuthLogin = () => {
    const { oauthProvider } = useParams<{ oauthProvider: string }>();
    const dispatch = useDispatch();
    const { isError, error, data, isLoading, isSuccess } = useGetOAuthLinkQuery(
        {
            oauthProvider: oauthProvider!,
        }
    );
    const statusCode = deriveStatusCode(error);

    useEffect(() => {
        if (!isError) return;

        if (typeof statusCode === 'number' && statusCode > 500) {
            dispatch(
                errorActions.showNotificationError(
                    'Something went wrong. Please try reloading the page.'
                )
            );
        }
    }, [isError, statusCode]);

    useEffect(() => {
        if (isSuccess) location.href = data.URL;
    }, [isSuccess, data]);

    return isLoading || isSuccess ? (
        <div className="flex-wrapper">
            <Loading />
        </div>
    ) : (
        <CenterBlock className={classes['oauth-block']}>
            {isError && (
                <Fragment>
                    <ErrorIcon className="icon" />
                    {statusCode === 422 &&
                    'data' in error! &&
                    (
                        error.data as ServerErrorResponse
                    ).errors[0].message.includes(
                        'Invalid authorization server name'
                    ) ? (
                        <p>Invalid OAuth 2.0 provider.</p>
                    ) : (
                        <p>Something went wrong</p>
                    )}
                    <ButtonLink to="/">Home</ButtonLink>
                </Fragment>
            )}
        </CenterBlock>
    );
};

export default OAuthLogin;
