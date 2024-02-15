import CustomError from './CustomError.js';

export default class ExceededMaxProductsToCheckError extends CustomError {
    public statusCode = 422;

    serializeErrors() {
        return [
            {
                message:
                    'only a limited number of products can be checked at once',
                maxAllowedProducts: +process.env.MAX_PRODUCTS_IN_CART!,
            },
        ];
    }
}
