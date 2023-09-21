import DisplayProduct from './DisplayProduct';

interface ProductUpsertReturnValue extends Omit<DisplayProduct, 'isInTheCart'> {
    maxOrderQuantity: number;
}

export default ProductUpsertReturnValue;
