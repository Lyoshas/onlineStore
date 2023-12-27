import CustomError from './CustomError.js';
import { PRODUCT_NOT_FOUND_MESSAGE } from '../graphql/errors/ProductNotFoundError.js';

class ProductNotFoundError extends CustomError {
    // the '422' status code was used instead of '404' only for consistency
    // other endpoints would also return '422' in cases when the resource that the user is requesting doesn't exist
    public statusCode = 422;

    serializeErrors() {
        return [{ message: PRODUCT_NOT_FOUND_MESSAGE }];
    }
}

export default ProductNotFoundError;
