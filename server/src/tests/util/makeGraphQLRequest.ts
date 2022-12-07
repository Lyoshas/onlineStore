import request from 'supertest';

export default (API_KEY: string | null, query: string) => {
    let finalRequest = request(process.env.API_URL)
        .post('/graphql');
    
    if (API_KEY !== null) {
        finalRequest = finalRequest.set('Authorization', `Bearer ${API_KEY}`);
    }

    return finalRequest.send({ query });
};
