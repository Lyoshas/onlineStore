import { deleteS3Objects } from '../../models/amazon-s3.js';

// this function will be called if anything goes wrong while adding or updating a product
// it will delete initialImageName and additionalImageName from the S3 bucket
export const performProductUpsertCleanup = (
    initialImageName: string,
    additionalImageName: string
) => {
    return deleteS3Objects([initialImageName, additionalImageName]);
};
