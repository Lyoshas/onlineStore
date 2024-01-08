import CustomError from './CustomError.js';

export default class TooManyProductsInCartError extends CustomError {
    public statusCode = 422;

    serializeErrors() {
        return [
            {
                message: 'the maximum limit of cart products has been exceeded',
                maxProductsInCart: +process.env.MAX_PRODUCTS_IN_CART!,
            },
        ];
    }
}
