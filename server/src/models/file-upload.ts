import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

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
