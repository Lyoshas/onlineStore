import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import ErrorIcon from '../../components/UI/Icons/ErrorIcon';
import Loading from '../../components/UI/Loading/Loading';
import { useOAuthCallbackMutation } from '../../store/apis/authApi';
import classes from './OAuthCallback.module.css';
import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';
import { authActions } from '../../store/slices/auth';
import LoadingScreen from '../../components/UI/LoadingScreen/LoadingScreen';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const [sendRequest, { isLoading, isSuccess, isUninitialized, data }] =
        useOAuthCallbackMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const request = sendRequest({
            queryString: searchParams.toString(),
        });

        return () => request.abort();
    }, []);

    useEffect(() => {
        if (!isSuccess) return;

        dispatch(authActions.updateAccessToken(data!.accessToken));
        navigate('/', { replace: true });
    }, [isSuccess]);

    return isLoading || isUninitialized || isSuccess ? (
        <LoadingScreen />
    ) : (
        <CenterBlock className={classes['oauth-block']}>
            <ErrorIcon className="icon" />
            <p>Something went wrong.</p>
            <ButtonLink to="/">Home</ButtonLink>
        </CenterBlock>
    );
};

export default OAuthCallback;
