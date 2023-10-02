import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Loading from '../../components/UI/Loading/Loading';
import { useLogoutMutation } from '../../store/apis/authApi';
import useApiError from '../../components/hooks/useApiError';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import ErrorIcon from '../../components/UI/Icons/ErrorIcon';
import { authActions } from '../../store/slices/auth';
import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';
import classes from './Logout.module.css';

const Logout = () => {
    const [logout, { isError, isSuccess, error }] = useLogoutMutation();
    const expectedErrorResponse = useApiError(isError, error, []);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const request = logout();

        // if the component unmount or the useEffect runs again, abort the request
        // this useEffect can run twice because we are using React StrictMode (the production environment won't be affected though)
        return () => request.abort();
    }, []);

    useEffect(() => {
        if (!isSuccess) return;

        dispatch(authActions.invalidateUser());
        navigate('/');
    }, [isSuccess]);

    let render: JSX.Element = (
        <div className="flex-wrapper">
            <Loading />
        </div>
    );

    if (isError) {
        render = (
            <CenterBlock className={classes['error-block']}>
                <ErrorIcon className="icon" />
                <p>Something went wrong.</p>
                <ButtonLink to="/">Home</ButtonLink>
            </CenterBlock>
        );
    }

    return render;
};

export default Logout;
