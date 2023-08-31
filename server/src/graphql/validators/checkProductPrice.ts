import { PriceOutOfRangeError } from '../errors/PriceOutOfRangeError.js';

const checkProductPrice = (price: number) => {
    if (price > 0 && price <= 9999999.99) return;

    throw new PriceOutOfRangeError();
};

export default checkProductPrice;
