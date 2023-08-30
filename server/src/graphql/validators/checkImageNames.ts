import { doesS3ObjectExist } from '../../models/amazon-s3.js';
import AdditionalImageNotFoundError from '../errors/AdditionalImageNotFoundError.js';
import InitialImageNotFoundError from '../errors/InitialImageNotFoundError.js';

const checkImageNames = async (
    initialImageName: string,
    additionalImageName: string
) => {
    if (!(await doesS3ObjectExist(initialImageName))) {
        throw new InitialImageNotFoundError();
    }

    if (!(await doesS3ObjectExist(additionalImageName))) {
        throw new AdditionalImageNotFoundError();
    }
};

export default checkImageNames;
