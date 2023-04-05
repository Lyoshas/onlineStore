import { FC, Fragment } from 'react';

import ButtonLink from '../../UI/ButtonLink/ButtonLink';
import classes from './HeaderButtons.module.css';
import MyCartButton from '../MyCartButton/MyCartButton';
import LogoutButton from '../LogoutButton/LogoutButton';

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
                    <ButtonLink
                        to="/auth/sign-in"
                        className={classes['side-links__item']}
                    >
                        Sign In
                    </ButtonLink>
                    <ButtonLink
                        to="/auth/sign-up"
                        className={classes['side-links__item']}
                    >
                        Sign Up
                    </ButtonLink>
                </Fragment>
            )}
        </nav>
    );
};

export default HeaderButtons;
