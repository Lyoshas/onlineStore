import { Link } from 'react-router-dom';

import classes from './SuggestAccountCreation.module.css';

const SuggestAccountCreation = () => {
    return (
        <p className={classes['sign-in__signup-paragraph']}>
            Don't have an account?{' '}
            <Link to="/auth/sign-up" className="link">
                Sign up
            </Link>
        </p>
    );
};

export default SuggestAccountCreation;
