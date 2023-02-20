import request from 'supertest';

export default (accessToken: string | null, query: string) => {
    let finalRequest = request(process.env.API_URL)
        .post('/graphql');
    
    if (accessToken !== null) {
        finalRequest = finalRequest.set('Authorization', `Bearer ${accessToken}`);
    }

    return finalRequest.send({ query });
};
