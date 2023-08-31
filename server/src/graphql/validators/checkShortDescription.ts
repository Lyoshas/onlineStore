import { IncorrectShortDescriptionLengthError } from '../errors/IncorrectShortDescriptionLengthError.js';

const checkShortDescription = (shortDescription: string) => {
    if (shortDescription.length >= 1 && shortDescription.length <= 300) return;

    throw new IncorrectShortDescriptionLengthError();
};

export default checkShortDescription;
