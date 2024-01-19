import { productReviewExists } from '../../models/product-review.js';
import { ReviewAlreadyExistsError } from '../errors/ReviewAlreadyExistsError.js';

const checkPreviousProductReview = async (
    productId: number,
    userId: number
) => {
    if (await productReviewExists(productId, userId)) {
        throw new ReviewAlreadyExistsError();
    }
};

export default checkPreviousProductReview;
