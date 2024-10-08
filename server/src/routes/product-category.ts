import { Router } from 'express';

import { getProductCategories } from '../controllers/product-category.js';

const router = Router();

router.get('/categories', getProductCategories);

export default router;