import { Client } from '@opensearch-project/opensearch';

const osearchClient = new Client({
    node: process.env.OPENSEARCH_NODE!,
    auth: {
        username: process.env.OPENSEARCH_USERNAME!,
        password: process.env.OPENSEARCH_PASSWORD!,
    },
    ssl: { rejectUnauthorized: false },
});

export default osearchClient;
