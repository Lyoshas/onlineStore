import { doesS3ObjectExist } from '../../models/file-upload.js';

const checkImageNames = async (
    initialImageName: string,
    additionalImageName: string
) => {
    if (!(await doesS3ObjectExist(initialImageName))) {
        throw new Error('initialImageName does not exist in the S3 bucket');
    }

    if (!(await doesS3ObjectExist(additionalImageName))) {
        throw new Error('additionalImageName does not exist in the S3 bucket');
    }
};

export default checkImageNames;
