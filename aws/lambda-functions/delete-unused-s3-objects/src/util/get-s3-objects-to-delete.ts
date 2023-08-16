import { S3ObjectsHashTable } from './get-all-images-from-db';

interface GetS3ObjectsToDeleteOptions {
    dbImages: S3ObjectsHashTable;
    bucketObjects: string[];
}

interface S3ObjectToDelete {
    Key: string;
}

// this function takes a list of all images in the DB and a list of all images in the 'onlinestore-product-images' S3 bucket
// and then returns which images in the S3 bucket are not associated with any product
// these images will be deleted because they are not needed
const getS3ObjectsToDelete = (
    options: GetS3ObjectsToDeleteOptions
): S3ObjectToDelete[] => {
    const { dbImages, bucketObjects } = options;

    const objectsToDelete: S3ObjectToDelete[] = [];

    bucketObjects.forEach((objectKey) => {
        if (!dbImages[objectKey]) objectsToDelete.push({ Key: objectKey });
    });

    return objectsToDelete;
};

export default getS3ObjectsToDelete;
