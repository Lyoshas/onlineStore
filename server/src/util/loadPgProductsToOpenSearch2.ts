import QueryStream from 'pg-query-stream';
import pg, { Pool, PoolClient } from 'pg';
import { Client } from '@opensearch-project/opensearch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'opensearch-product-loader.env') });

if (
	process.env.OPENSEARCH_NODE == null ||
	process.env.OPENSEARCH_USERNAME == null ||
	process.env.OPENSEARCH_PASSWORD == null ||
	process.env.OPENSEARCH_PRODUCTS_INDEX_NAME == null
) {
	throw new Error('Not all environment variables are defined');
}

interface AnyObject {
	[prop: string]: unknown;
}

const snakeCaseToCamelCase = (inputStr: string): string => {
	return inputStr.replace(/_[a-z]/gi, (match: string) => {
		return match[1].toUpperCase();
	});
};

const osearchClient = new Client({
	node: process.env.OPENSEARCH_NODE!,
	auth: {
		username: process.env.OPENSEARCH_USERNAME!,
		password: process.env.OPENSEARCH_PASSWORD!,
	},
	ssl: { rejectUnauthorized: false },
});

const pgPool = new pg.Pool({
	ssl: { rejectUnauthorized: false },
});

const formatSqlQuery = (sqlQuery: string) => {
	return (
		sqlQuery
			.trim()
			// replace tabs and new lines with a space character
			.replace(/(\t)|(\n)/g, ' ')
			// replace two or more consecutive spaces
			.replace(/\s{2,}/g, ' ')
	);
};
const camelCaseObject = <T extends object>(
	input: T
): CamelCaseProperties<T> => {
	// if "input" is anything but an object or an array, return "input" immediately
	if (
		(typeof input !== 'object' && !Array.isArray(input)) ||
		input === null
	) {
		return input;
	}

	// if we make it here, "input" is either an array or an object
	if (Array.isArray(input)) {
		return input.map((nestedValue) => camelCaseObject(nestedValue)) as any;
	} else {
		// "input" is an object
		const result: AnyObject = {};
		for (let [key, value] of Object.entries(input)) {
			result[snakeCaseToCamelCase(key)] = camelCaseObject(value);
		}
		return result as any;
	}
};

type CamelCase<T extends string> = T extends `${infer First}_${infer Rest}`
	? `${Lowercase<First>}${Capitalize<CamelCase<Rest>>}`
	: `${Lowercase<T>}`;

type CamelCaseProperties<T> = {
	[key in keyof T as CamelCase<string & key>]: T[key] extends Array<
		infer NestedType
	>
		? CamelCaseProperties<NestedType>[]
		: T[key] extends object
		? CamelCaseProperties<T[key]>
		: T[key];
};

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
