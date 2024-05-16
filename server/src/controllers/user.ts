import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import UserModel from '../models/user.js';

export const getProfile: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const userModel = new UserModel();

        const { firstName, lastName } = await userModel.getProfileByUserId(
            req.user!.id
        );

        console.log(await userModel.getProfileByUserId(req.user!.id));

        res.json({ firstName, lastName });
    }
);
