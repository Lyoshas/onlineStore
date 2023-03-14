import { FC, Fragment, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import SignUp from './pages/SignUp/SignUp';
import './App.css';
import ActivateAccount from './pages/ActivateAccount/ActivateAccount';
import SignIn from './pages/SignIn/SignIn';
import useFetch from './components/hooks/useFetch';
import { authActions } from './store/slices/auth';
import ErrorNotification from './components/UI/ErrorNotification/ErrorNotification';
import EnsureStatus from './components/EnsureStatus/EnsureStatus';
import { RootState } from './store';
import { errorActions } from './store/slices/error';

const App: FC = () => {
    const { errorMessage, isErrorNotificationShown } = useSelector(
        (state: RootState) => state.error
    );
    const dispatch = useDispatch();
    const {
        // this will send a request to get a new access token
        // if the refresh token is absent or invalid, the request will return the 422 status code
        sendRequest: authenticateUser,
        JSONResponse,
        unexpectedRequestError,
        wasRequestSuccessful,
    } = useFetch('/api/auth/refresh', {}, 200);

    useEffect(() => {
        authenticateUser();
    }, []);

    useEffect(() => {
        // if the request hasn't been sent yet
        if (wasRequestSuccessful === null) return;

        console.log(`is user authenticated? ${wasRequestSuccessful}`);

        dispatch(
            // if the server returned the 200 status code
            wasRequestSuccessful
                ? authActions.updateAccessToken(JSONResponse.accessToken)
                : authActions.invalidateUser()
        );
    }, [wasRequestSuccessful]);

    useEffect(() => {
        if (!unexpectedRequestError) return;

        dispatch(errorActions.showNotificationError(unexpectedRequestError));
    }, [unexpectedRequestError]);

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
                <Route path="/sign-up" element={<SignUp />} />
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
