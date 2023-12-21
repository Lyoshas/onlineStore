import { RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import { getProductCategories as retrieveProductCategories } from '../models/product-category.js';
import ProductCategory from '../interfaces/ProductCategory.js';

export const getProductCategories: RequestHandler<
    unknown,
    { categories: ProductCategory[] }
> = asyncHandler(async (req, res, next) => {
    res.json({ categories: await retrieveProductCategories() });
});
