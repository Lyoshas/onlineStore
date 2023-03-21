import { Fragment } from 'react';
import { useSelector } from 'react-redux';

import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';
import SuccessIcon from '../../components/UI/Icons/SuccessIcon';
import Loading from '../../components/UI/Loading/Loading';
import { RootState } from '../../store';
import classes from './SuccessMessage.module.css';

const SuccessMessage = () => {
    const isAuthenticated = useSelector((state: RootState) => {
        return state.auth.isAuthenticated;
    });

    return (
        <Fragment>
            {isAuthenticated === null ? (
                <Loading color="#273c99" />
            ) : (
                <div className={classes['success-block']}>
                    <SuccessIcon />
                    <p>The password has been changed successfully.</p>
                    <ButtonLink to={isAuthenticated ? '/' : '/sign-in'}>
                        {isAuthenticated ? 'Home Page' : 'Sign In'}
                    </ButtonLink>
                </div>
            )}
        </Fragment>
    );
};

export default SuccessMessage;
