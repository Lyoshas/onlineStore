import ButtonLink from '../../UI/ButtonLink/ButtonLink';
import classes from './AuthLinks.module.css';

const AuthActions = () => {
    return (
        <nav className={classes['top-header__auth-links']}>
            <ButtonLink
                to="/auth/sign-in"
                className={classes['auth-links__item']}
            >
                Sign In
            </ButtonLink>
            <ButtonLink
                to="/auth/sign-up"
                className={classes['auth-links__item']}
            >
                Sign Up
            </ButtonLink>
        </nav>
    );
};

export default AuthActions;
