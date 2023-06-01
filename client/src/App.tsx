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
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import CheckResetToken from './pages/ResetPassword/CheckResetToken';
import TopHeader from './components/TopHeader/TopHeader';
import OAuthLogin from './pages/OAuthLogin/OAuthLogin';
import OAuthCallback from './pages/OAuthCallback/OAuthCallback';
import Logout from './pages/Logout/Logout';
import useApiError from './components/hooks/useApiError';
import LandingPage from './components/LandingPage/LandingPage';
import ProductInfo from './components/ProductInfo/ProductInfo';
import EditProduct from './components/EditProduct/EditProduct';

const App: FC = () => {
    const { errorMessage, isErrorNotificationShown } = useSelector(
        (state: RootState) => state.error
    );
    const dispatch = useDispatch();
    const { data, isSuccess, isFetching, isError, error } =
        useRequestAccessTokenQuery();
    const serverErrorResponse = useApiError(isError, error, [422]);

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
                    path="/"
                    element={
                        <TopHeader
                            RenderAfter={<LandingPage />}
                            addOffset={false}
                        />
                    }
                />
                <Route
                    path="/auth/sign-up"
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
                    path="/auth/sign-in"
                    element={
                        // the user must be unauthenticated to access this route
                        <EnsureStatus auth={false}>
                            <SignIn />
                        </EnsureStatus>
                    }
                />
                <Route
                    path="/auth/forgot-password"
                    element={<ForgotPassword />}
                />
                <Route
                    path="/auth/reset-password/:resetToken"
                    element={
                        <CheckResetToken>
                            <ResetPassword />
                        </CheckResetToken>
                    }
                />
                <Route
                    path="/auth/log-in-with/:oauthProvider"
                    element={
                        <EnsureStatus auth={false}>
                            <OAuthLogin />
                        </EnsureStatus>
                    }
                />
                <Route
                    path="/auth/oauth-callback"
                    element={
                        <EnsureStatus auth={false}>
                            <OAuthCallback />
                        </EnsureStatus>
                    }
                />
                <Route
                    path="/auth/logout"
                    element={
                        <EnsureStatus auth={true}>
                            <Logout />
                        </EnsureStatus>
                    }
                />
                <Route
                    path="/products/:productId"
                    element={
                        <TopHeader
                            RenderAfter={<ProductInfo />}
                            addOffset={true}
                        />
                    }
                />
                <Route
                    path="/edit-product/:productId"
                    element={
                        // ensure the user is logged in and is an admin
                        <EnsureStatus auth={true} admin={true}>
                            <TopHeader
                                RenderAfter={<EditProduct />}
                                addOffset={true}
                            />
                        </EnsureStatus>
                    }
                />
            </Routes>
        </Fragment>
    );
};

export default App;
