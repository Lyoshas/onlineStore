import ButtonLink from '../../../components/UI/ButtonLink/ButtonLink';
import CenterBlock from '../../../components/UI/CenterBlock/CenterBlock';
import SuccessIcon from '../../../components/UI/Icons/SuccessIcon';
import classes from './SuccessMessage.module.css';

const SuccessMessage = () => {
    return (
        <CenterBlock className={classes['add-product-success']}>
            <SuccessIcon />
            <p>The product has been added successfully.</p>
            <ButtonLink to="/">Home</ButtonLink>
        </CenterBlock>
    );
};

export default SuccessMessage;
