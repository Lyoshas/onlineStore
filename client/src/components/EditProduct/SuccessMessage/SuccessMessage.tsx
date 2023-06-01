import ButtonLink from '../../UI/ButtonLink/ButtonLink';
import CenterBlock from '../../UI/CenterBlock/CenterBlock';
import SuccessIcon from '../../UI/Icons/SuccessIcon';
import classes from './SuccessMessage.module.css';

const SuccessMessage = () => {
    return (
        <CenterBlock className={classes['edit-product-success']}>
            <SuccessIcon className="icon" />
            <p>The product has been updated successfully.</p>
            <ButtonLink to="/">Home</ButtonLink>
        </CenterBlock>
    );
};

export default SuccessMessage;
