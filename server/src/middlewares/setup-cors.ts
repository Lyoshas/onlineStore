import { RequestHandler } from 'express';

const setupCors: RequestHandler = (req, res, next) => {
    res.setHeader(
        'Access-Control-Allow-Origin',
        'https://onlinestore-potapchuk.click'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') return res.sendStatus(204);

    next();
};

export default setupCors;
