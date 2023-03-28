import { RequestHandler } from 'express';

import EndpointNotFoundError from '../errors/EndpointNotFoundError';

const notFoundHandler: RequestHandler = (req, res, next) => {
    throw new EndpointNotFoundError();
};

export default notFoundHandler;
