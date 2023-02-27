import React, { FC, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { RootState } from '../../store';
import Loading from '../UI/Loading/Loading';

// this component is used to create protected routes
// this can be used to redirect users if they are unauthenticated or authenticated
const EnsureStatus: FC<{
    auth: boolean; // true - the user must be authenticated to access this route, false - must NOT be authenticated
    children: React.ReactNode;
}> = (props) => {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );

    let render: JSX.Element | React.ReactNode;

    const navigateElem = <Navigate to="/" replace />;
    switch (isAuthenticated) {
        case null:
            render = (
                <div className="flex-wrapper">
                    <Loading />
                </div>
            );
            break;
        case true:
            render = props.auth ? props.children : navigateElem;
            break;
        case false:
            render = props.auth ? navigateElem : props.children;
            break;
    }

    return <Fragment>{render}</Fragment>;
};

export default EnsureStatus;
