import Button from '../../UI/Button/Button';
import classes from './AddToCartButton.module.css';

const AddToCartButton = () => {
    return (
        <Button className={classes['product-item__cart-btn']}>
            <img
                className={classes['cart-btn__icon']}
                src="/cart-icon.svg"
                alt="Cart"
            />
        </Button>
    );
};

export default AddToCartButton;
