import React, { FC, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { RootState } from '../../store';
import LoadingScreen from '../UI/LoadingScreen/LoadingScreen';

// this component is used to create protected routes
// this can be used to redirect users if they are unauthenticated or authenticated or if they are not admins
const EnsureStatus: FC<{
    auth: boolean; // true - the user must be authenticated to access this route, false - must NOT be authenticated
    admin?: boolean; // true - the user must be an admin to access this route, otherwise it doesn't matter whether the user is an admin or not
    children: React.ReactNode;
}> = (props) => {
    const { isAuthenticated, isAdmin } = useSelector(
        (state: RootState) => state.auth
    );

    let render: JSX.Element | React.ReactNode;
    const navigateElem = <Navigate to="/" replace />;

    if (isAuthenticated === null || isAdmin === null) {
        render = <LoadingScreen />;
    } else if (
        // if the 'auth' option is specified and the user is NOT authenticated
        (props.auth && !isAuthenticated) ||
        // if the 'auth' option is not specified and the user IS authenticated
        (!props.auth && isAuthenticated) ||
        // if the 'admin' option is specified and the user is not an admin
        (props.admin && !isAdmin)
    ) {
        // redirect the user
        render = navigateElem;
    } else {
        // otherwise allow the user to access this route
        render = props.children;
    }

    return <Fragment>{render}</Fragment>;
};

export default EnsureStatus;
