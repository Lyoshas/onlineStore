import { IncorrectProductReviewLengthError } from '../errors/IncorrectProductReviewLengthError.js';

const checkReviewMessage = (reviewMessage: string) => {
    if (reviewMessage.length > 0 && reviewMessage.length <= 2000) {
        return;
    }

    throw new IncorrectProductReviewLengthError();
};

export default checkReviewMessage;
