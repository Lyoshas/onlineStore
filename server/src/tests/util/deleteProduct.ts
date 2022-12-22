import makeGraphQLRequest from './makeGraphQLRequest';

export default async (API_KEY: string | null, productId: number) => {
    const { body, statusCode } = await makeGraphQLRequest(API_KEY, `
        mutation {
            deleteProduct(id: ${productId}) {
                id
            }
        }
    `);
    return { body, statusCode };
};
