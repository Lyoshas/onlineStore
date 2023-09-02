import DisplayProduct from './DisplayProduct';

interface ProductUpsertReturnValue extends DisplayProduct {
    maxOrderQuantity: number;
}

export default ProductUpsertReturnValue;
