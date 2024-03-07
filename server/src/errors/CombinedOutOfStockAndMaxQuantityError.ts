import CustomError from './CustomError.js';

export const combinedOutOfStockAndMaxQuantityErrorMessage =
    'order cannot be placed for any products because they are either out of stock or surpass the maximum order quantity';

export default class CombinedOutOfStockAndMaxQuantityError extends CustomError {
    public statusCode = 422;

    serializeErrors() {
        return [
            {
                message: combinedOutOfStockAndMaxQuantityErrorMessage,
            },
        ];
    }
}
