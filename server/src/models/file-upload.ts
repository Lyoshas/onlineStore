import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';

import s3Client from '../services/s3.service';

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
    return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${filename}`;
};
