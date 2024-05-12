import { Link } from 'react-router-dom';

import ErrorIcon from '../../components/UI/Icons/ErrorIcon';
import classes from './CheckResetToken.module.css';

const InvalidLink = () => {
    return (
        <div className={classes['reset-token-block']}>
            <ErrorIcon className="icon" />
            <p>Посилання або недійсне, або термін його дії закінчився.</p>
            <p>
                Будь ласка, запросіть ще одне посилання{' '}
                <Link to="/auth/forgot-password" className="link">
                    тут
                </Link>
            </p>
        </div>
    );
};

export default InvalidLink;
