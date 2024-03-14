import QueryStream from 'pg-query-stream';

// esClient and pgPool need some environment variables that were loaded by 'dotenv'
import esClient from '../services/elasticsearch.service.js';
import pgPool from '../services/postgres.service.js';
import formatSqlQuery from './formatSqlQuery.js';
import camelCaseObject from './camelCaseObject.js';

// specifies how many documents can be indexes per 1 bulk request
const MAX_BULK_REQUEST_SIZE = 1000;
const PRODUCTS_INDEX_NAME = 'products';

// this function inserts new documents to Elasticsearch
const sendBulkRequest = (body: any[]) => {
    console.log('Sending a Bulk request to Elasticsearch...');
    return esClient.bulk({ operations: body });
};

// this function loads products inside PostgreSQL to Elasticsearch
// the 'products' index is completely deleted first, so use this funciton with caution
const loadPgProductsToElasticSearch = async () => {
    console.log('Removing the index...');
    // removing all existing data inside the index
    // if an index already exists, an error will be thrown, so we're going to ignore it
    try {
        await esClient.indices.delete({ index: PRODUCTS_INDEX_NAME });
    } catch (e) {}

    const query = new QueryStream(
        formatSqlQuery(`
            SELECT
                p.id AS product_id,
                p.title,
                c.category AS category,
                p.short_description
            FROM products AS p
            INNER JOIN product_categories AS c ON c.id = p.category_id
        `)
    );
    const pgClient = await pgPool.connect();
    const pgStream = pgClient.query(query);

    const resourceCleanup = () => {
        pgClient.release();
        esClient.close();
        pgPool.end();
    };

    let bulkRequestBody: { [prop: string]: any }[] = [];
    pgStream.on(
        'data',
        (row: {
            product_id: number;
            title: string;
            category: string;
            short_description: string;
        }) => {
            const productData = camelCaseObject(row);

            bulkRequestBody.push({
                index: {
                    _index: PRODUCTS_INDEX_NAME,
                    _id: productData.productId,
                },
            });
            bulkRequestBody.push(productData);

            if (bulkRequestBody.length >= MAX_BULK_REQUEST_SIZE) {
                pgStream.pause();
                sendBulkRequest(bulkRequestBody)
                    .then((result) => {
                        if (result.errors) return Promise.reject();
                        bulkRequestBody = [];
                        pgStream.resume();
                    })
                    .catch((err) => {
                        console.log(err);
                        pgStream.destroy();
                        resourceCleanup();
                    });
            }
        }
    );

    pgStream.on('close', async () => {
        if (bulkRequestBody.length > 0) {
            await sendBulkRequest(bulkRequestBody);
        }
        resourceCleanup();
    });
};

loadPgProductsToElasticSearch();
