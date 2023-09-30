import { FC, Fragment } from 'react';

import classes from './HeaderButtons.module.css';
import MyCartButton from '../MyCartButton/MyCartButton';
import LogoutButton from '../LogoutButton/LogoutButton';
import SigninButton from '../SigninButton/SigninButton';
import SignupButton from '../SignupButton/SignupButton';

const HeaderButtons: FC<{ isAuth: boolean }> = ({ isAuth }) => {
    return (
        <nav className={classes['top-header__side-links']}>
            {isAuth ? (
                <Fragment>
                    <MyCartButton />
                    <LogoutButton />
                </Fragment>
            ) : (
                <Fragment>
                    <SigninButton />
                    <SignupButton />
                </Fragment>
            )}
        </nav>
    );
};

export default HeaderButtons;
