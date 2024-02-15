import CustomError from './CustomError.js';

class SomeProductsNotFoundError extends CustomError {
    public statusCode = 422;

    serializeErrors() {
        return [{ message: "some of the provided product IDs don't exist" }];
    }
}

export default SomeProductsNotFoundError;
