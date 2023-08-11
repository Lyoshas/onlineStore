import AwsCredentials from '../interfaces/AwsCredentials';

const awsCredentials: AwsCredentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

export default awsCredentials;
