import CustomError from './CustomError.js';

// this error will be used for getting a presigned url to upload to S3
// right now only admins will be able to do this
class NotAdminError extends CustomError {
    statusCode = 403;

    constructor() {
        super();
    }

    serializeErrors() {
        return [{ message: 'User must be an admin to perform this action' }];
    }
}

export default NotAdminError;
