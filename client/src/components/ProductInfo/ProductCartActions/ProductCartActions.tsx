import classes from './ProductCartActions.module.css';
import Button from '../../UI/Button/Button';
import QuantitySelector from '../../QuantitySelector/QuantitySelector';

const ProductCartActions = () => {
    const handleQuantityChange = (newQuantity: number) => {
        console.log('Product Quantity:', newQuantity);
    };

    return (
        <div className={classes['product-cart-actions']}>
            {/* hardcoding 'initialValue' for now */}
            <QuantitySelector
                initialValue={1}
                minValue={1}
                maxValue={32767}
                onQuantityChange={handleQuantityChange}
            />
            <Button>Add to Cart</Button>
        </div>
    );
};

export default ProductCartActions;
