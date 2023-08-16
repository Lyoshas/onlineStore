import list1000BucketObjects from './list-1000-bucket-objects';

// fetches all objects from the S3 bucket that stores product images
const listAllBucketObjects = async (): Promise<string[]> => {
    const totalObjects: string[] = [];
    let continuationToken: string | null = null;

    do {
        const { s3Objects: currentS3Objects, nextContinuationToken } =
            await list1000BucketObjects(continuationToken);

        totalObjects.push(...currentS3Objects);

        continuationToken = nextContinuationToken;
    } while (continuationToken !== null);

    return totalObjects;
};

export default listAllBucketObjects;
