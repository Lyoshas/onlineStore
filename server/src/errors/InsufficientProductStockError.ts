import CustomError from './CustomError.js';

class InsufficientProductStockError extends CustomError {
    statusCode = 409;

    serializeErrors() {
        return [{ message: 'insufficient stock available for this product' }];
    }
}

export default InsufficientProductStockError;
