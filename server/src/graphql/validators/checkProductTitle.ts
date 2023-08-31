import { IncorrectTitleLengthError } from '../errors/IncorrectTitleLengthError.js';

const checkProductTitle = (title: string) => {
    if (title.length >= 1 && title.length <= 200) return;

    throw new IncorrectTitleLengthError();
};

export default checkProductTitle;
