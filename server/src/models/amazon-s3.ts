import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
    DeleteObjectsCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3ServiceException,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { fileTypeFromStream } from 'file-type';

import s3Client from '../services/s3.service.js';
import { logger } from '../loggers/logger.js';

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;

interface GeneratePresignedUrlArgs {
    bucketName: string;
    objectKey: string;
    contentType: string;
    contentLength: number;
    expirationTimeInSeconds: number;
}

export const generatePresignedUrl = async (
    options: GeneratePresignedUrlArgs
): Promise<string> => {
    const {
        bucketName,
        contentType,
        expirationTimeInSeconds,
        objectKey,
        contentLength,
    } = options;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: contentType,
        ContentLength: contentLength,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: expirationTimeInSeconds,
    });

    return signedUrl;
};

export const getImageUrlByObjectKey = (filename: string) => {
    return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${filename}`;
};

/**
 * Examples:
 * 1) getS3ObjectKeyByUrl("https://onlinestore-product-images.s3.eu-north-1.amazonaws.com/17bdd15e-190b-44a6-a555-93906d11df28.png") => "17bdd15e-190b-44a6-a555-93906d11df28.png"
 * 2) getS3ObjectKeyByUrl("/api/images/ff042894-a2d5-457d-b9b2-82f7cde46255.png") => "ff042894-a2d5-457d-b9b2-82f7cde46255.png"
 */
export const getObjectKeyByImageUrl = (imageURL: string): string => {
    const IMAGE_NAME_REGEX =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png/i;
    return imageURL.match(IMAGE_NAME_REGEX)![0];
};

export const doesS3ObjectExist = async (filename: string) => {
    try {
        // using HeadObjectCommand to check if the object key exists
        await s3Client.send(
            new HeadObjectCommand({ Bucket: S3_BUCKET_NAME, Key: filename })
        );

        return true;
    } catch (error) {
        if (error instanceof S3ServiceException && error.name === 'NotFound') {
            return false;
        }

        // otherwise forward the error
        throw error;
    }
};

// this function checks the magic number of the specified S3 object and returns its MIME type or undefined if there is no match
// please make sure this file exists in the S3 bucket before using this function
export const getMagicNumberMimeType = async (
    filename: string,
    // if the specified object wasn't found, an error will be thrown with "objectNotFoundErrorMessage" as its message
    objectNotFoundErrorMessage: string
) => {
    try {
        const response = await s3Client.send(
            new GetObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: filename,
                // fetching the first 4096 bytes of the S3 object
                // it will be enough to determine the file type based on magic number of the file
                Range: 'bytes=0-4095',
            })
        );

        const fileTypeResult = await fileTypeFromStream(
            response.Body as Readable
        );

        return fileTypeResult?.mime;
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        let message = 'An unexpected error occurred while checking a MIME type of an S3 object';
        
        // in order for AWS SDK to return the "NoSuchKey" error, the bucket must have the "ListBucket" permission attached
        if (error instanceof S3ServiceException && error.name === 'NoSuchKey') {
            message = objectNotFoundErrorMessage;
        }
        
        throw new Error(message);
    }
};

// this function removes specified objects from the S3 bucket
// this function should be used if you want to delete multiple objects from S3 using a single HTTP request
// "objectNames" must be an array of object names that you want to delete, e.g. ["image1.png", "image2.png"]
export const deleteS3Objects = (objectNames: string[]) => {
    return s3Client.send(
        new DeleteObjectsCommand({
            Bucket: S3_BUCKET_NAME,
            Delete: {
                Objects: objectNames.map((objectName) => ({ Key: objectName })),
            },
        })
    );
};
