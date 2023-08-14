import { getMagicNumberMimeType } from '../../models/amazon-s3.js';
import InitialImageNotFoundError from '../errors/InitialImageNotFoundError.js';
import AdditionalImageNotFoundError from '../errors/AdditionalImageNotFoundError.js';

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
        throw new Error('The MIME type of initialImageName is not "image/png"');
    } else if (additionalImageMimeType !== 'image/png') {
        throw new Error(
            'The MIME type of additionalImageName is not "image/png"'
        );
    }
};

export default checkImageMimeTypes;
