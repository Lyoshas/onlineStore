import QueryStream from 'pg-query-stream';
import { Pool, PoolClient } from 'pg';
import { Client } from '@opensearch-project/opensearch';

// osearchClient and pgPool need some environment variables that were loaded by 'dotenv'
import osearchClient from '../services/opensearch.service.js';
import pgPool from '../services/postgres.service.js';
import formatSqlQuery from './formatSqlQuery.js';
import camelCaseObject from './camelCaseObject.js';
import CamelCaseProperties from '../interfaces/CamelCaseProperties.js';

interface ProductRow {
    product_id: number;
    title: string;
    category: string;
    short_description: string;
}

class ProductLoader {
    private static PRODUCTS_INDEX: string =
        process.env.OPENSEARCH_PRODUCTS_INDEX_NAME!;

    constructor(
        private readonly pgPool: Pool,
        private readonly pgClient: PoolClient,
        private readonly osearchClient: Client
    ) {}

    public async loadPgProductsToOpenSearch(): Promise<void> {
        return new Promise((resolve) => {
            const productStream = this.getPgProductStream();

            let bulkRequestBody: (
                | { create: { _index: string } }
                | CamelCaseProperties<ProductRow>
            )[] = [];
            productStream.on('data', (row: ProductRow) => {
                const productData = camelCaseObject(row);
                bulkRequestBody.push({
                    create: {
                        _index: ProductLoader.PRODUCTS_INDEX,
                    },
                });
                bulkRequestBody.push(productData);
            });

            productStream.on('close', async () => {
                await osearchClient.bulk({
                    index: ProductLoader.PRODUCTS_INDEX,
                    body: bulkRequestBody,
                });
                resolve();
            });
        });
    }

    public async productsIndexExists(): Promise<boolean> {
        const { body } = await this.osearchClient.indices.exists({
            index: ProductLoader.PRODUCTS_INDEX,
        });
        return body;
    }

    public async removeProductsIndex(): Promise<void> {
        await osearchClient.indices.delete({
            index: ProductLoader.PRODUCTS_INDEX,
        });
    }

    private getPgProductStream(): QueryStream {
        const query = new QueryStream(
            formatSqlQuery(`
                SELECT
                    p.id AS product_id,
                    p.title,
                    c.category AS category,
                    p.short_description
                FROM products AS p
                INNER JOIN product_categories AS c ON c.id = p.category_id
                ORDER BY p.id
            `)
        );

        return this.pgClient.query(query);
    }

    public async resourceCleanup(): Promise<void> {
        this.pgClient.release();
        await this.osearchClient.close();
        await this.pgPool.end();
    }
}

async function main() {
    const productLoader = new ProductLoader(
        pgPool,
        await pgPool.connect(),
        osearchClient
    );

    try {
        // removing all the stored products from OpenSearch
        console.log('Checking if the product index exists...');
        if (await productLoader.productsIndexExists()) {
            console.log('The product index exists, removing it...');
            await productLoader.removeProductsIndex();
            console.log('The index has been successfully removed');
        } else {
            console.log('The product index does not exist');
        }

        console.log('Copying products stored in PostgreSQL into OpenSearch...');
        await productLoader.loadPgProductsToOpenSearch();
    } catch (e) {
        throw e;
    } finally {
        await productLoader.resourceCleanup();
    }
}

main();
