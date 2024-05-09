import CustomError from './CustomError.js';

class ProductNotFoundError extends CustomError {
    public statusCode = 409; // 409 Conflict

    serializeErrors() {
        return [
            {
                message:
                    'The fundraising campaign has already reached its goal and is now closed for further donations.',
            },
        ];
    }
}

export default ProductNotFoundError;
