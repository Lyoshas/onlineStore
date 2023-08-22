import { getMagicNumberMimeType } from '../../models/amazon-s3.js';
import InitialImageNotFoundError from '../errors/InitialImageNotFoundError.js';
import AdditionalImageNotFoundError from '../errors/AdditionalImageNotFoundError.js';
import InitialImageMimeTypeError from '../errors/InitialImageMimeTypeError.js';
import AdditionalImageMimeTypeError from '../errors/AdditionalImageMimeTypeError.js';

const checkImageMimeTypes = async (
    initialImageName: string,
    additionalImageName: string
) => {
    const initialImageMimeType = await getMagicNumberMimeType(
        initialImageName,
        new InitialImageNotFoundError().message
    );

    const additionalImageMimeType = await getMagicNumberMimeType(
        additionalImageName,
        new AdditionalImageNotFoundError().message
    );

    if (initialImageMimeType !== 'image/png') {
        throw new InitialImageMimeTypeError();
    } else if (additionalImageMimeType !== 'image/png') {
        throw new AdditionalImageMimeTypeError();
    }
};

export default checkImageMimeTypes;
