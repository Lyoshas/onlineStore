import { S3Client } from '@aws-sdk/client-s3';

import { env } from '../env/env-variables';

const s3Client = new S3Client({ region: env.AMAZON_S3_REGION });

export default s3Client;
