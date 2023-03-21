import React, { FC } from 'react';
import { useParams } from 'react-router-dom';

import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import Loading from '../../components/UI/Loading/Loading';
import { useCheckResetTokenValidityQuery } from '../../store/apis/authApi';
import deriveStatusCode from '../../util/deriveStatusCode';
import InvalidLink from './InvalidLink';
import classes from './CheckResetToken.module.css';
import ErrorIcon from '../../components/UI/Icons/ErrorIcon';

// this component is used to verify the resetToken on the server side
const CheckResetToken: FC<{ children: React.ReactNode }> = (props) => {
    const { resetToken } = useParams<{ resetToken: string }>();

    const { isFetching, isSuccess, data, isError, error, refetch } =
        useCheckResetTokenValidityQuery({ resetToken: resetToken! });

    let content: React.ReactNode = (
        <div className={classes['reset-token-block']}>
            <ErrorIcon className="icon" />
            <p>Something went wrong. Please try reloading the page.</p>
        </div>
    );

    if (isFetching) {
        content = <Loading color="#273c99" />;
    } else if (isSuccess) {
        // if the reset token is valid
        if (data!.isValid) {
            // show the form where the user can enter their new password
            // this form will be in props.children
            content = props.children;
        } else {
            content = <InvalidLink />;
        }
    } else if (isError) {
        const statusCode = deriveStatusCode(error);
        if (statusCode === 503) {
            // the server discarded the request because of rate limiting,
            // in this case refetch the request in 1 second
            setTimeout(refetch, 1000);
            content = <Loading color="#273c99" />;
        }
    }

    return <CenterBlock>{content}</CenterBlock>;
};

export default CheckResetToken;
