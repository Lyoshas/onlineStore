import {
    it,
    expect,
    describe,
} from 'vitest';

import dbPool from '../../util/database';
import loadEnvVariables from '../util/loadEnv';
import { createUserAndReturnAPIKey } from '../util/createUser';
import makeGraphQLRequest from '../util/makeGraphQLRequest';
import DBProduct from '../../interfaces/DBProduct';
import {
    randomInteger,
    randomString,
    randomFloat
} from '../util/random';

loadEnvVariables();

// we don't isolate the transactions, because we want our API server to 
// see changes made by the test suite. When you update a product, 
// a new product needs to be created beforehand

// it takes an id and returns a query prefilled with random values
function randomProductInfo(): Omit<DBProduct, 'id'> {
    return {
        title: randomString(25),
        price: randomFloat(randomInteger(1, 7), 2),
        previewURL: `http://${randomString(50)}`,
        quantityInStock: randomInteger(1, 50)
    };
}

// it should return the id of the newly created product
async function createProduct(
    productInfo: Omit<DBProduct, 'id'>
): Promise<number> {
    const { title, price, previewURL, quantityInStock } = productInfo;
    return dbPool.query(`
        INSERT INTO products (title, price, preview_url, quantity_in_stock)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `, [title, price, previewURL, quantityInStock])
        .then(({ rows }) => rows[0].id as number);
}

async function executeUpdateQuery(
    API_KEY: string | null,
    productInfo: DBProduct
) {
    return makeGraphQLRequest(
        API_KEY,
        `
            mutation {
                updateProduct(
                    id: ${productInfo.id},
                    title: "${productInfo.title}",
                    price: ${productInfo.price},
                    previewURL: "${productInfo.previewURL}",
                    quantityInStock: ${productInfo.quantityInStock}
                ) {
                    id
                    title
                    price
                    previewURL
                    isAvailable
                    isRunningOut
                }
            }
        `
    );
}

describe('Updating a product with GraphQL', async () => {
    async function createAndUpdateProduct(API_KEY: string | null) {
        // creating a product and getting its id
        const productId: number = await createProduct(randomProductInfo());

        // generating information to update the product
        const newProductInfo: Omit<DBProduct, 'id'> = randomProductInfo();

        const { body, statusCode } = await executeUpdateQuery(API_KEY, {
            id: productId,
            ...newProductInfo
        });

        // expectedProductInfo - random data that was generated.
        // this data was then passed to the update query to replace the old data,
        // whereas returnedProductInfo is what GraphQL returned as a result of the update
        return {
            body,
            statusCode,
            expectedProductInfo: { id: productId, ...newProductInfo },
            returnedProductInfo: body.data.updateProduct
        };
    }

    it('should update a product if a user is an admin and is activated', async () => {
        const API_KEY: string = await createUserAndReturnAPIKey({
            isAdmin: true,
            isActivated: true
        });

        const {
            expectedProductInfo,
            returnedProductInfo
        } = await createAndUpdateProduct(API_KEY);

        expect(returnedProductInfo).toMatchObject({
            id: expectedProductInfo.id,
            title: expectedProductInfo.title,
            price: expectedProductInfo.price,
            previewURL: expectedProductInfo.previewURL,
            isAvailable: expectedProductInfo.quantityInStock > 0,
            isRunningOut: expectedProductInfo.quantityInStock <= 5
        });
    });

    it('should throw an error if the specified id does not exist in the database', async () => {
        const API_KEY: string = await createUserAndReturnAPIKey({
            isAdmin: true,
            isActivated: true
        });
        const nonExistentProductId = 999999; // make sure this id doesn't exist in the DB

        const { body } = await executeUpdateQuery(API_KEY, {
            id: nonExistentProductId,
            ...randomProductInfo()
        });

        expect(body.errors[0].message).toBe(
            `Product with id=${nonExistentProductId} does not exist`
        );
    });

    it('should throw an error if none of the fields except the id are specified', async () => {
        const API_KEY: string = await createUserAndReturnAPIKey({
            isAdmin: true,
            isActivated: true
        });

        const productId: number = await createProduct(randomProductInfo());

        const { body } = await makeGraphQLRequest(
            API_KEY,
            `
            mutation {
                updateProduct(
                    id: ${productId}
                ) {
                    id
                    title
                    price
                    previewURL
                    isAvailable
                    isRunningOut
                }
            }
        `
        );

        expect(body.errors[0].message).toBe(
            'At least one of these fields ' +
            '("title", "price", "previewURL" and "quantityInStock") ' +
            'must be specified'
        );
    });

    it('should throw an error if a user is an admin but is not activated', async () => {
        const API_KEY: string = await createUserAndReturnAPIKey({
            isAdmin: true,
            isActivated: false
        });

        const { body } = await createAndUpdateProduct(API_KEY);

        expect(body.errors[0].message).toBe('User must be activated to perform this action');
    });

    it('should throw an error if a user is not an admin but is activated', async () => {
        const API_KEY: string = await createUserAndReturnAPIKey({
            isAdmin: false,
            isActivated: true
        });

        const { body } = await createAndUpdateProduct(API_KEY);

        expect(body.errors[0].message).toBe('User must be an admin to perform this action');
    });

    it('should throw an error if a user is not an admin and is not activated', async () => {
        const API_KEY: string = await createUserAndReturnAPIKey({
            isAdmin: false,
            isActivated: false
        });

        const { body } = await createAndUpdateProduct(API_KEY);

        expect(body.errors[0].message).toBe('User must be activated to perform this action');
    });

    it('should throw an error if a user is not authenticated', async () => {
        const { body } = await createAndUpdateProduct(null);

        expect(body.errors[0].message).toBe('User must be authenticated to perform this action');
    });
});
