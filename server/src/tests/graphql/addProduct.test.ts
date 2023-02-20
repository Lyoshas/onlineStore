import {
    it,
    expect,
    describe,
} from 'vitest';

import loadEnvVariables from '../util/loadEnv';
import { createUserAndReturnAccessToken } from '../util/createUser';
import makeGraphQLRequest from '../util/makeGraphQLRequest';

loadEnvVariables();

describe('adding a new product with GraphQL', async () => {
    const query = `
        mutation {
            addProduct(
                title: "Test Product",
                price: 24999,
                previewURL: "http://randomURL.com"
                quantityInStock: 6
            ) {
                id
            }
        }
    `;

    it('should create a new product if a user is authenticated and is an admin', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: true,
            isActivated: true
        });

        const { body, statusCode } = await makeGraphQLRequest(accessToken, query);
        console.log(body);
        const productId = body.data.addProduct.id;

        // if everything went well, we should get status code 200
        // and productId, which is a number
        expect(statusCode).toBe(200);
        expect(productId).toBeTypeOf('number');
    });

    it('should return an error if a user is authenticated and is an admin but is not activated', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: true,
            isActivated: false
        });

        const { body } = await makeGraphQLRequest(accessToken, query);
        
        expect(body.errors[0].message).toBe('User must be activated to perform this action'); 
    });

    it('should return an error if a user is authenticated and activated but is not an admin', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: false,
            isActivated: true
        });

        const { body } = await makeGraphQLRequest(accessToken, query);
        
        expect(body.errors[0].message).toBe('User must be an admin to perform this action')
    });

    it('should return an error if a user is authenticated, but is neither activated nor an admin', async () => {
        const accessToken: string = await createUserAndReturnAccessToken({
            isAdmin: false,
            isActivated: false
        });

        const { body } = await makeGraphQLRequest(accessToken, query);

        expect(body.errors[0].message).toBe('User must be activated to perform this action');
    })

    it('should return an error if a user is not authenticated', async () => {
        const accessToken = null;

        const { body } = await makeGraphQLRequest(accessToken, query);
        
        expect(body.errors[0].message).toBe('User must be authenticated to perform this action');
    });
})

