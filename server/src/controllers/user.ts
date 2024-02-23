import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import * as userModel from '../models/user.js';

export const getProfile: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const { firstName, lastName } = await userModel.getProfileByUserId(
            req.user!.id
        );

        console.log(await userModel.getProfileByUserId(req.user!.id));

        res.json({ firstName, lastName });
    }
);
