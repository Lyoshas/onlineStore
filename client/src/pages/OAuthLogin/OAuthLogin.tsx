import { useParams } from 'react-router-dom';
import { Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import ErrorIcon from '../../components/UI/Icons/ErrorIcon';
import Loading from '../../components/UI/Loading/Loading';
import classes from './OAuthLogin.module.css';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';
import { useGetOAuthLinkQuery } from '../../store/apis/authApi';
import ServerErrorResponse from '../../interfaces/ServerErrorResponse';
import useApiError from '../../components/hooks/useApiError';
import LoadingScreen from '../../components/UI/LoadingScreen/LoadingScreen';

const OAuthLogin = () => {
    const { oauthProvider } = useParams<{ oauthProvider: string }>();
    const { isError, error, data, isLoading, isSuccess } = useGetOAuthLinkQuery(
        {
            oauthProvider: oauthProvider!,
        }
    );
    const expectedErrorResponse = useApiError(isError, error, [422]);
    const statusCode =
        expectedErrorResponse && expectedErrorResponse.statusCode;

    useEffect(() => {
        if (isSuccess) location.href = data.URL;
    }, [isSuccess, data]);

    return isLoading || isSuccess ? (
        <LoadingScreen />
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
                        <p>Недійсний постачальник OAuth 2.0.</p>
                    ) : (
                        <p>Щось пішло не так</p>
                    )}
                    <ButtonLink to="/">На головну</ButtonLink>
                </Fragment>
            )}
        </CenterBlock>
    );
};

export default OAuthLogin;
