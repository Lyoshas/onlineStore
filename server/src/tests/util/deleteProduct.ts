import makeGraphQLRequest from './makeGraphQLRequest';

export default async (accessToken: string | null, productId: number) => {
    const { body, statusCode } = await makeGraphQLRequest(accessToken, `
        mutation {
            deleteProduct(id: ${productId}) {
                id
            }
        }
    `);
    return { body, statusCode };
};
