import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
    HeadObjectCommand,
    PutObjectCommand,
    S3ServiceException,
} from '@aws-sdk/client-s3';

import s3Client from '../services/s3.service.js';

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
