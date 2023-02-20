import express from 'express';
import { body } from 'express-validator';

import * as cartController from '../controllers/cart';
import ensureAuthentication from '../middlewares/ensure-authentication';
import validateRequest from '../middlewares/validate-request';
import dbPool from '../util/database';

const router = express.Router();

router.get('/cart', ensureAuthentication, cartController.getUserCart);

// add or edit
router.put(
    '/cart',
    ensureAuthentication,
    body(
        'productId',
        'productId must be a valid identifier that points to a product'
    )
        .isNumeric()
        .custom(async (productId: number) => {
            const doesProductExist: boolean = await dbPool.query(
                'SELECT EXISTS(SELECT 1 FROM products WHERE id = $1)',
                [productId]
            ).then(({ rows }) => rows[0].exists);
            if (!doesProductExist) return Promise.reject();
            return Promise.resolve();
        }),
    body('quantity')
        .isInt({ gt: 0 })
        .withMessage('quantity must be an integer and greater than zero'),
    validateRequest,
    cartController.addProductToCart
);

router.delete(
    '/cart/:productId',
    ensureAuthentication,
    cartController.deleteProductFromCart
);

export default router;
