import CustomError from './CustomError.js';

export class ExceededMaxOrderQuantityError extends CustomError {
    statusCode = 409;

    constructor(private maxOrderQuantity: number) {
        super();
    }

    serializeErrors() {
        return [
            {
                message: 'more products are added to the cart than allowed',
                maximumAllowedProducts: this.maxOrderQuantity,
            },
        ];
    }
}
