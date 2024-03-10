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
import LandingPage from './pages/LandingPage/LandingPage';
import ProductInfo from './pages/ProductInfo/ProductInfo';
import EditProduct from './pages/EditProduct/EditProduct';
import AddProduct from './pages/AddProduct/AddProduct';
import CartContentsModal from './components/CartContentsModal/CartContentsModal';
import { cartModalActions } from './store/slices/cartModal';
import ProductCategoryList from './pages/ProductCategoryList/ProductCategoryList';
import ProductListPage from './pages/ProductListPage/ProductListPage';
import useSynchronizeLocalCartProducts from './components/hooks/useSynchronizeLocalCartProducts';
import Checkout from './pages/Checkout/Checkout';

const App: FC = () => {
    const { errorMessage, isErrorNotificationShown } = useSelector(
        (state: RootState) => state.error
    );
    const isCartModalShown = useSelector(
        (state: RootState) => state.cartModal.isCartModalShown
    );
    const dispatch = useDispatch();
    const { data, isSuccess, isFetching, isError, error } =
        useRequestAccessTokenQuery();
    const serverErrorResponse = useApiError(isError, error, [422]);
    // when a user logs in, their local cart will be seamlessly synchronized with the API
    useSynchronizeLocalCartProducts();

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
            {isCartModalShown && (
                <CartContentsModal
                    onClose={() => {
                        dispatch(cartModalActions.hideCartModal());
                    }}
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
                    path="/products"
                    element={
                        <TopHeader
                            RenderAfter={<ProductCategoryList />}
                            addOffset={true}
                        />
                    }
                />
                <Route
                    path="/products/category/:productCategory"
                    element={
                        <TopHeader
                            RenderAfter={<ProductListPage />}
                            addOffset={true}
                        />
                    }
                />
                <Route
                    path="/user/cart/checkout"
                    element={
                        <TopHeader
                            RenderAfter={<Checkout />}
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
                <Route
                    path="/add-product"
                    element={
                        // ensure the user is logged in and is an admin
                        <EnsureStatus auth={true} admin={true}>
                            <TopHeader
                                RenderAfter={<AddProduct />}
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
