import SuccessIcon from '../../components/UI/Icons/SuccessIcon';
import classes from './SuccessMessage.module.css';

const SuccessMessage = () => {
    return (
        <div className={classes['success-block']}>
            <SuccessIcon />
            <p>The link has been sent to your email.</p>
            <b>Please check the "spam" folder as well!</b>
        </div>
    );
};

export default SuccessMessage;
