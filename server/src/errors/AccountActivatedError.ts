import CustomError from './CustomError';

// this error will be used in endpoint that require a user's account to be unactivated
export default class AccountActivatedError extends CustomError {
    statusCode = 409;

    constructor() { super(); }

    serializeErrors() {
        return [{ message: 'Account is already activated' }];
    }
}
