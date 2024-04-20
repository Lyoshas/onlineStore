import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import * as warrantyRequestModel from '../models/warranty-request.js';

export const getWarrantyRequests: RequestHandler = asyncHandler(
    async (req, res, next) => {
        const userId = req.user!.id;

        res.json({
            warrantyRequests:
                await warrantyRequestModel.getWarrantyRequestsByUserId(userId),
        });
    }
);
