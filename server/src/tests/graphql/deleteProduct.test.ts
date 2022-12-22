import {
    it,
    expect,
    describe,
} from 'vitest';

import { createUserAndReturnAPIKey } from '../util/createUser';
import {
    randomProductInfo
} from '../util/random';
import createProduct from '../util/createProduct';
import doesProductExist from '../util/doesProductExist';
import deleteProduct from '../util/deleteProduct';

// we don't isolate the transactions, because we want our API server to 
// see changes made by the test suite. When you delete a product, 
// a new product needs to be created beforehand

describe('Deleting a product with GraphQL', async () => {
    it('should delete a product if a user is an administrator and is activated', async () => {
        const API_KEY: string = await createUserAndReturnAPIKey({
            isAdmin: true,
            isActivated: true
        });

        const productId = await createProduct(randomProductInfo());

        const { body } = await deleteProduct(API_KEY, productId);
        const isProductAvailableInDB = await doesProductExist(productId);

        expect(body.data.deleteProduct.id).toBe(productId);
        expect(isProductAvailableInDB).toBe(false);
    });

    const testData: {
        API_KEY: string | null,
        productId: number,
        errorMessage: string
    }[] = [
        {
            API_KEY: await createUserAndReturnAPIKey({ isAdmin: true, isActivated: true }),
            productId: 1234567, // make sure this productId doesn't exist
            errorMessage: 'A product with the specified id does not exist'
        },
        {
            API_KEY: await createUserAndReturnAPIKey({ isAdmin: true, isActivated: false }),
            productId: await createProduct(randomProductInfo()),
            errorMessage: 'User must be activated to perform this action'
        },
        {
            API_KEY: await createUserAndReturnAPIKey({ isAdmin: false, isActivated: true }),
            productId: await createProduct(randomProductInfo()),
            errorMessage: 'User must be an admin to perform this action'
        },
        {
            API_KEY: await createUserAndReturnAPIKey({ isAdmin: false, isActivated: false }),
            productId: await createProduct(randomProductInfo()),
            errorMessage: 'User must be activated to perform this action'
        },
        {
            API_KEY: null,
            productId: await createProduct(randomProductInfo()),
            errorMessage: 'User must be authenticated to perform this action'
        }
    ]

    describe.each(testData)(
        'Deleting a product with the specified input should return an error',
        ({ API_KEY, productId, errorMessage }) => {
            it(`should return an error of "${errorMessage}"`, async () => {
                const { body } = await deleteProduct(API_KEY, productId);

                expect(body.data.deleteProduct).toBeNull();
                expect(body.errors[0].message)
                    .toBe(errorMessage);
            });
        }
    );
});
