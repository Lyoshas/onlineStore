import { Link } from 'react-router-dom';

import classes from './SuggestAccountCreation.module.css';

const SuggestAccountCreation = () => {
    return (
        <p className={classes['sign-in__signup-paragraph']}>
            Не маєте акаунта?{' '}
            <Link to="/auth/sign-up" className="link">
                Зареєструватися
            </Link>
        </p>
    );
};

export default SuggestAccountCreation;
