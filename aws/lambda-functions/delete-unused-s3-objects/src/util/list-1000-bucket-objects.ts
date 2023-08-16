import { ListObjectsV2Command } from '@aws-sdk/client-s3';

import s3Client from '../services/s3.service';

interface List1000S3ObjectsOutput {
    s3Objects: string[];
    // "nextContinuationToken" will be null if you have fetched every S3 object in the bucket
    nextContinuationToken: string | null;
}

// lists the first 1000 objects of an S3 bucket
// to retrieve more, it's necessary to provide a continuation token
// you can get this token by accessing response.NextContinuationToken:
/*
    const response = await s3Client.send(
        new ListObjectsV2Command({
            Bucket: S3_BUCKET,
        })
    );

    response.NextContinuationToken
*/
const list1000BucketObjects = async (
    continuationToken: string | null
): Promise<List1000S3ObjectsOutput> => {
    const { Contents, NextContinuationToken } = await s3Client.send(
        new ListObjectsV2Command({
            Bucket: process.env.AMAZON_S3_BUCKET!,
            ContinuationToken: continuationToken || void 0,
        })
    );

    if (!Contents) {
        return {
            s3Objects: [],
            nextContinuationToken: null,
        };
    }

    // null is returned if there are no objects in the S3 bucket
    return {
        s3Objects: Contents.map((entry) => entry.Key!),
        nextContinuationToken: NextContinuationToken || null,
    };
};

export default list1000BucketObjects;
