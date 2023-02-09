import CustomError from './CustomError'

export default class EmptyCartError extends CustomError {
    statusCode = 409; // this status code will be sent if a user tries to create an order with an empty cart (how can an order be created out of nothing?)

    constructor() {
        super();
    }

    serializeErrors() {
        return [{ message: 'The user cart is empty' }];
    }
}
