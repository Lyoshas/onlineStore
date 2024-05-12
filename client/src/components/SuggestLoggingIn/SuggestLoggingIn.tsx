import { Link } from 'react-router-dom';

import classes from './SuggestLoggingIn.module.css';

const SuggestLoggingIn = () => {
    return (
        <p className={classes['signup-form__signin-paragraph']}>
            Уже маєте акаунт?{' '}
            <Link to="/auth/sign-in" className="link">
                Увійти
            </Link>
        </p>
    );
};

export default SuggestLoggingIn;
