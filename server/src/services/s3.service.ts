import { S3Client } from '@aws-sdk/client-s3';

import awsCredentials from '../util/awsCredentials.js';

const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: awsCredentials,
});

export default s3Client;
