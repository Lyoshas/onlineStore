import express from 'express';
import { body } from 'express-validator';

import * as cartController from '../controllers/cart.js';
import ensureAuthentication from '../middlewares/ensure-authentication.js';
import validateRequest from '../middlewares/validate-request.js';
import dbPool from '../services/postgres.service.js';
import { getProductQuantity } from '../models/product.js';

const router = express.Router();

router.get('/cart', ensureAuthentication, cartController.getUserCart);

router.get(
    '/cart/count',
    ensureAuthentication,
    cartController.getCartItemCount
);

// add or edit
router.put(
    '/cart',
    ensureAuthentication,
    body('productId')
        .isNumeric()
        .withMessage('productId must be a number')
        .bail()
        .custom(async (productId: number) => {
            const doesProductExist: boolean = await dbPool
                .query('SELECT EXISTS(SELECT 1 FROM products WHERE id = $1)', [
                    productId,
                ])
                .then(({ rows }) => rows[0].exists);
            if (!doesProductExist) return Promise.reject();
            return Promise.resolve();
        })
        .withMessage('productId must point to a valid product'),
    // if the product id is invalid, return the error and don't check any other field
    validateRequest,
    body('quantity')
        .isInt({ gt: 0 })
        .withMessage('quantity must be an integer and greater than zero')
        .bail()
        .custom(async (providedQuantity: number, { req }) => {
            // we need to check whether we have this many products in stock

            const productQuantity = await getProductQuantity(
                // we've already validated req.body.productId, so we can use type casting
                req.body.productId as number
            );

            if (productQuantity < providedQuantity) return Promise.reject();
        })
        .withMessage('insufficient stock available for this product'),
    validateRequest,
    cartController.addProductToCart
);

router.delete(
    '/cart/:productId',
    ensureAuthentication,
    cartController.deleteProductFromCart
);

export default router;
