import { RequestHandler } from 'express';

import NotAdminError from '../errors/NotAdminError.js';

const ensureAdmin: RequestHandler = (req, res, next) => {
    if (req.user && req.user.isAdmin) return next();

    throw new NotAdminError();
};

export default ensureAdmin;
