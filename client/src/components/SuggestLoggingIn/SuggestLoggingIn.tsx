import { Link } from 'react-router-dom';

import classes from './SuggestLoggingIn.module.css';

const SuggestLoggingIn = () => {
    return (
        <p className={classes['signup-form__signin-paragraph']}>
            Already have an account?{' '}
            <Link to="/auth/sign-in" className="link">
                Sign in
            </Link>
        </p>
    );
};

export default SuggestLoggingIn;
