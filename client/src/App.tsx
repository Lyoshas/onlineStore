import { FC, Fragment, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import SignUp from './pages/SignUp/SignUp';
import './App.css';
import ActivateAccount from './pages/ActivateAccount/ActivateAccount';
import SignIn from './pages/SignIn/SignIn';
import { authActions } from './store/slices/auth';
import ErrorNotification from './components/UI/ErrorNotification/ErrorNotification';
import EnsureStatus from './components/EnsureStatus/EnsureStatus';
import { RootState } from './store';
import { errorActions } from './store/slices/error';
import { useRequestAccessTokenQuery } from './store/apis/authApi';

const App: FC = () => {
    const { errorMessage, isErrorNotificationShown } = useSelector(
        (state: RootState) => state.error
    );
    const dispatch = useDispatch();
    const { data, isSuccess, isFetching, isError, error } =
        useRequestAccessTokenQuery();

    useEffect(() => {
        if (isFetching) return;

        console.log(`is user authenticated? ${isSuccess}`);

        dispatch(
            // if the server returned the 200 status code
            isSuccess
                ? authActions.updateAccessToken(data.accessToken)
                : authActions.invalidateUser()
        );
    }, [isSuccess, isFetching]);

    useEffect(() => {
        if (!isError) return;

        if (
            ('data' in error && error.status >= 500) ||
            ('originalStatus' in error && error.originalStatus >= 500)
        ) {
            dispatch(
                errorActions.showNotificationError(
                    'Something went wrong while authenticating. Please reload the page.'
                )
            );
        }
    }, [isError, error]);

    return (
        <Fragment>
            {isErrorNotificationShown && (
                <ErrorNotification
                    message={errorMessage}
                    onClose={() =>
                        dispatch(errorActions.hideNotificationError())
                    }
                />
            )}
            <Routes>
                <Route
                    path="/sign-up"
                    element={
                        // the user must be unauthenticated to access this route
                        <EnsureStatus auth={false}>
                            <SignUp />
                        </EnsureStatus>
                    }
                />
                <Route
                    path="/auth/activate-account/:activationToken"
                    element={<ActivateAccount />}
                />
                <Route
                    path="/sign-in"
                    element={
                        // the user must be unauthenticated to access this route
                        <EnsureStatus auth={false}>
                            <SignIn />
                        </EnsureStatus>
                    }
                />
            </Routes>
        </Fragment>
    );
};

export default App;
