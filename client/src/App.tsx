import { FC, useEffect, useReducer } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import SignUp from './pages/SignUp/SignUp';
import './App.css';
import ActivateAccount from './pages/ActivateAccount/ActivateAccount';
import SignIn from './pages/SignIn/SignIn';
import useFetch from './components/hooks/useFetch';
import { authActions } from './store/slices/auth';
import ErrorNotification, {
    ErrorActionType,
    errorNotificationReducer,
} from './components/UI/ErrorNotification/ErrorNotification';
import EnsureStatus from './components/EnsureStatus/EnsureStatus';

const App: FC = () => {
    const [errorState, dispatchError] = useReducer(errorNotificationReducer, {
        isErrorNotificationShown: false,
        errorMessage: '',
    });
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

        dispatchError({
            type: ErrorActionType.SHOW_NOTIFICATION_ERROR,
            errorMessage: unexpectedRequestError,
        });
    }, [unexpectedRequestError]);

    return (
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
            {errorState.isErrorNotificationShown && (
                <Route
                    path="*"
                    element={
                        <ErrorNotification
                            message={errorState.errorMessage}
                            onClose={() =>
                                dispatchError({ type: ErrorActionType.HIDE_ERROR })
                            }
                        />
                    }
                />
            )}
        </Routes>
    );
};

export default App;
