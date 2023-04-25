import { it, expect, describe } from 'vitest';

import loadEnvVariables from '../util/loadEnv';
import { createUserAndReturnAccessToken } from '../util/createUser';
import makeGraphQLRequest from '../util/makeGraphQLRequest';
import DBProduct from '../../interfaces/DBProduct';
import { randomProductInfo } from '../util/random';
import isProductAvailable from '../../graphql/helpers/isProductAvailable';
import isProductRunningOut from '../../graphql/helpers/isProductRunningOut';
import createProduct from '../util/createProduct';
import CamelCaseProperties from '../../interfaces/CamelCaseProperties';

loadEnvVariables();

// we don't isolate the transactions, because we want our API server to
// see changes made by the test suite. When you update a product,
// a new product needs to be created beforehand

async function executeUpdateQuery(
    accessToken: string | null,
    productInfo: CamelCaseProperties<DBProduct>
) {
    return makeGraphQLRequest(
        accessToken,
        `
            mutation {
                updateProduct(
                    id: ${productInfo.id},
                    title: "${productInfo.title}",
                    price: ${productInfo.price},
                    initialImageUrl: "${productInfo.initialImageUrl}",
                    additionalImageUrl: "${productInfo.additionalImageUrl}",
                    quantityInStock: ${productInfo.quantityInStock},
                    shortDescription: "${productInfo.shortDescription}"
                ) {
                    id
                    title
                    price
                    initialImageUrl
                    additionalImageUrl
                    shortDescription
                    isAvailable
                    isRunningOut
                }
            }
        `
    );
}

describe('Updating a product with GraphQL', async () => {
    async function createAndUpdateProduct(accessToken: string | null) {
        // creating a product and getting its id
        const productId: number = await createProduct(randomProductInfo());

        // generating information to update the product
        const newProductInfo = randomProductInfo();

        const { body, statusCode } = await executeUpdateQuery(accessToken, {
            id: productId,
            ...newProductInfo,
        });

        // expectedProductInfo - random data that was generated.
        // this data was then passed to the update query to replace the old data,
        // whereas returnedProductInfo is what GraphQL returned as a result of the update
        console.log(body);
        return {
            body,
            statusCode,
            expectedProductInfo: { id: productId, ...newProductInfo },
            returnedProductInfo: body.data?.updateProduct,
        };
    }

    it('should update a product if a user is an admin and is activated', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: true,
            isActivated: true,
        });

        const { expectedProductInfo, returnedProductInfo } =
            await createAndUpdateProduct(accessToken);

        expect(returnedProductInfo).toMatchObject({
            id: expectedProductInfo.id,
            title: expectedProductInfo.title,
            price: expectedProductInfo.price,
            initialImageUrl: expectedProductInfo.initialImageUrl,
            additionalImageUrl: expectedProductInfo.additionalImageUrl,
            shortDescription: expectedProductInfo.shortDescription,
            isAvailable: isProductAvailable(
                expectedProductInfo.quantityInStock
            ),
            isRunningOut: isProductRunningOut(
                expectedProductInfo.quantityInStock
            ),
        });
    });

    it('should throw an error if the specified id does not exist in the database', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: true,
            isActivated: true,
        });
        const nonExistentProductId = 999999; // make sure this id doesn't exist in the DB

        const { body } = await executeUpdateQuery(accessToken, {
            id: nonExistentProductId,
            ...randomProductInfo(),
        });

        expect(body.errors[0].message).toBe(
            `Product with id=${nonExistentProductId} does not exist`
        );
    });

    it('should throw an error if none of the fields except the id are specified', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: true,
            isActivated: true,
        });

        const productId: number = await createProduct(randomProductInfo());

        const { body } = await makeGraphQLRequest(
            accessToken,
            `
            mutation {
                updateProduct(
                    id: ${productId}
                ) {
                    id
                    title
                    price
                    initialImageUrl
                    additionalImageUrl
                    shortDescription
                    isAvailable
                    isRunningOut
                }
            }
        `
        );

        expect(body.errors[0].message).toBe(
            'Field "updateProduct" argument "title" of type "String!" is required, ' +
                'but it was not provided.'
        );
    });

    it('should throw an error if a user is an admin but is not activated', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: true,
            isActivated: false,
        });

        const { body } = await createAndUpdateProduct(accessToken);

        expect(body.errors[0].message).toBe(
            'User must be activated to perform this action'
        );
    });

    it('should throw an error if a user is not an admin but is activated', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: false,
            isActivated: true,
        });

        const { body } = await createAndUpdateProduct(accessToken);

        expect(body.errors[0].message).toBe(
            'User must be an admin to perform this action'
        );
    });

    it('should throw an error if a user is not an admin and is not activated', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: false,
            isActivated: false,
        });

        const { body } = await createAndUpdateProduct(accessToken);

        expect(body.errors[0].message).toBe(
            'User must be activated to perform this action'
        );
    });

    it('should throw an error if a user is not authenticated', async () => {
        const { body } = await createAndUpdateProduct(null);

        expect(body.errors[0].message).toBe(
            'User must be authenticated to perform this action'
        );
    });
});
