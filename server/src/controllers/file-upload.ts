import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import { generatePresignedUrl } from '../models/amazon-s3.js';

interface GetS3PresignedUrlQuery {
    fileName: string;
    mimeType: string;
    contentLength: string;
}

// export const getS3PresignedUrl = asyncHandler(async (req, res, next) => {
//     const { fileName, mimeType, contentLength } = req.query;
// });

export const getS3PresignedUrl: RequestHandler<
    unknown,
    // res.body
    { presignedUrl: string },
    unknown,
    // req.query
    unknown // I couldn't assign GetS3PresignedUrlQuery here, becauase otherwise TypeScript throws an error
> = asyncHandler(async (req, res, next) => {
    const { fileName, mimeType, contentLength } =
        req.query as GetS3PresignedUrlQuery;

    res.json({
        presignedUrl: await generatePresignedUrl({
            bucketName: process.env.S3_BUCKET_NAME!,
            objectKey: fileName,
            contentType: mimeType,
            contentLength: +contentLength,
            expirationTimeInSeconds:
                +process.env.S3_PRESIGNED_URL_EXPIRATION_TIME_IN_SECONDS!,
        }),
    });
});
