// this lambda function is used to delete S3 objects that are not associated with any product in the RDS database
// it will act as a cron job that will be executed every day at 12 AM
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';

import listAllBucketObjects from './util/list-all-bucket-objects';
import getAllImagesFromDB from './util/get-all-images-from-db';
import getS3ObjectsToDelete from './util/get-s3-objects-to-delete';
import s3Client from './services/s3.service';
import { env } from './env/env-variables';

interface LambdaResponse {
    statusCode: number;
    message: string;
}

// we don't need the provided CloudWatch event, so we'll omit it
export const handler = async (): Promise<LambdaResponse> => {
    try {
        // this returns which objects in the S3 bucket are not associated with any product in the DB
        // these objects need to be deleted because they don't do anything and only take up space in the S3 bucket
        const objectsToDelete = getS3ObjectsToDelete({
            dbImages: await getAllImagesFromDB(),
            bucketObjects: await listAllBucketObjects(),
        });

        if (objectsToDelete.length === 0) {
            return {
                statusCode: 200,
                message: 'There is nothing to delete',
            };
        }

        // deleting the objects
        const deleteResponse = await s3Client.send(
            new DeleteObjectsCommand({
                Bucket: env.AMAZON_S3_BUCKET,
                Delete: { Objects: objectsToDelete },
            })
        );

        if (deleteResponse.Errors) {
            throw new Error(JSON.stringify(deleteResponse.Errors));
        }

        return {
            statusCode: 200,
            message: 'The images have been deleted successfully',
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            message: String(error),
        };
    }
};
