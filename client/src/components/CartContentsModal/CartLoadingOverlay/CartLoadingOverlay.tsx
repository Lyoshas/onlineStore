import Loading from '../../UI/Loading/Loading';
import classes from './CartLoadingOverlay.module.css';

// this component appears when a user adds or deletes a product from the cart
const CartLoadingOverlay = () => {
    return (
        <div className={classes['cart-upsert-preloader']}>
            <Loading color="#273c99" />
        </div>
    );
};

export default CartLoadingOverlay;
