import Button from '../../UI/Button/Button';
import Image from '../Image/Image';
import classes from './MyCartButton.module.css';

const MyCartButton = () => {
    return (
        <Button className={classes['cart-button']}>
            <Image src="/cart-icon.svg" alt="Cart" />
            My Cart (<span>0</span>)
        </Button>
    );
};

export default MyCartButton;
