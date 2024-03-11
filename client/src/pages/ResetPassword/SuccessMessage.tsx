import { Fragment } from 'react';
import { useSelector } from 'react-redux';

import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';
import { RootState } from '../../store';
import SuccessMessageBlock from '../../components/UI/SuccessMessageBlock/SuccessMessageBlock';
import classes from './SuccessMessage.module.css';

const SuccessMessage = () => {
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    return (
        <SuccessMessageBlock
            className={classes['success-block']}
            content={
                <Fragment>
                    <p>The password has been changed successfully.</p>
                    <ButtonLink to={isAuthenticated ? '/' : '/auth/sign-in'}>
                        {isAuthenticated ? 'Home Page' : 'Sign In'}
                    </ButtonLink>
                </Fragment>
            }
        />
    );
};

export default SuccessMessage;
