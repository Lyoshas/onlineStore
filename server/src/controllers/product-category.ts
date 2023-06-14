import { RequestHandler } from 'express';

import { getProductCategories as retrieveProductCategories } from '../models/product-category';

export const getProductCategories: RequestHandler = async (req, res, next) => {
    res.json({ categories: await retrieveProductCategories() });
};