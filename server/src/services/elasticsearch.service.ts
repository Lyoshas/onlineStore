import { Client } from '@elastic/elasticsearch';
import fs from 'fs';
import path from 'path';

const esClient = new Client({
    node: process.env.ELASTICSEARCH_NODE!,
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME!,
        password: process.env.ELASTICSEARCH_PASSWORD!,
    },
    ssl: {
        // ca: fs.readFileSync(
        //     path.join(
        //         process.cwd(),
        //         'src',
        //         'config',
        //         'elasticsearch_http_ca.crt'
        //     )
        // ),
        rejectUnauthorized: false
    },
});

export default esClient;
