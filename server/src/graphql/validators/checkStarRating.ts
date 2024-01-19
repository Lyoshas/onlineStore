import { IncorrectStarRatingError } from '../errors/IncorrectStarRatingError.js';

const checkStarRating = (starRating: number) => {
    if (starRating >= 1 && starRating <= 5 && starRating % 0.5 === 0) {
        return;
    }

    throw new IncorrectStarRatingError();
};

export default checkStarRating;
