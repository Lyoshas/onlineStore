import { Link } from 'react-router-dom';

import ErrorIcon from '../../components/UI/Icons/ErrorIcon';
import classes from './CheckResetToken.module.css';

const InvalidLink = () => {
    return (
        <div className={classes['reset-token-block']}>
            <ErrorIcon className="icon" />
            <p>The link is either invalid or has expired.</p>
            <p>
                Please request another one{' '}
                <Link to="/forgot-password" className="link">
                    here
                </Link>
            </p>
        </div>
    );
};

export default InvalidLink;
