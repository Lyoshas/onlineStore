import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import { getProductCategories as retrieveProductCategories } from '../models/product-category.js';

export const getProductCategories: RequestHandler = asyncHandler(
    async (req, res, next) => {
        res.json({ categories: await retrieveProductCategories() });
    }
);
