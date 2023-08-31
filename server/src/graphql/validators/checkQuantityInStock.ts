import { QuantityInStockOutOfRangeError } from '../errors/QuantityInStockOutOfRangeError.js';

const checkQuantityInStock = (quantityInStock: number) => {
    if (quantityInStock >= 0 && quantityInStock <= 32767) return;

    throw new QuantityInStockOutOfRangeError();
};

export default checkQuantityInStock;
