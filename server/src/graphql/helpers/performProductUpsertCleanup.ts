import {
    deleteS3Objects,
    getImageUrlByObjectKey,
} from '../../models/amazon-s3.js';
import isProductImageUsed from './isProductImageUsed.js';

// this function will be called if anything goes wrong while adding or updating a product
// it will delete initialImageName and additionalImageName from the S3 bucket
export const performProductUpsertCleanup = async (
    initialImageName: string,
    additionalImageName: string
) => {
    // if there are other products that rely on these images, we won't delete the images
    const imagesToDelete: string[] = [];

    if (!(await isProductImageUsed(getImageUrlByObjectKey(initialImageName)))) {
        imagesToDelete.push(initialImageName);
    }

    if (
        !(await isProductImageUsed(getImageUrlByObjectKey(additionalImageName)))
    ) {
        imagesToDelete.push(additionalImageName);
    }

    if (imagesToDelete.length === 0) return;

    return deleteS3Objects(imagesToDelete);
};
