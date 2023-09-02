import { MaxOrderQuantityOutOfRangeError } from '../errors/MaxOrderQuantityOutOfRangeError.js';

const checkMaxOrderQuantity = (maxOrderQuantity: number) => {
    if (maxOrderQuantity > 0 && maxOrderQuantity <= 32767) return;

    throw new MaxOrderQuantityOutOfRangeError();
};

export default checkMaxOrderQuantity;
