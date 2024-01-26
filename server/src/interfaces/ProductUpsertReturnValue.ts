import DisplayProduct from './DisplayProduct';

interface ProductUpsertReturnValue
    extends Omit<DisplayProduct, 'isInTheCart' | 'userRating'> {
    maxOrderQuantity: number;
}

export default ProductUpsertReturnValue;
