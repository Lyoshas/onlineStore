import CustomError from './CustomError.js';

export default class CombinedOutOfStockAndMaxQuantityError extends CustomError {
    public statusCode = 422;

    serializeErrors() {
        return [
            {
                message: 'order cannot be placed because the cart is empty',
            },
        ];
    }
}
