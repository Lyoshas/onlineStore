import CustomError from './CustomError.js';

export default class AccountNotActivatedError extends CustomError {
    statusCode = 403;
    
    constructor() { super(); }

    serializeErrors() {
        return [{ message: 'The account is not activated' }];
    }
}
