import { RequestHandler } from 'express';

import * as authModel from '../models/auth';
import VerifiedUserInfo from '../interfaces/VerifiedUserInfo';

declare global {
    namespace Express {
        interface Request {
            user: VerifiedUserInfo | null
        }
    }
};

const identifyUser: RequestHandler = async (req, res, next) => {
    const API_KEY = req.headers.authorization?.split(' ')[1];

    try {
        if (!API_KEY) throw new Error('API_KEY is not specified');
        req.user = await authModel.verifyAPIKey(API_KEY) as VerifiedUserInfo;
    } catch (e) {
        req.user = null;
    } finally {
        next();
    }
};

export default identifyUser;
