import express from 'express';
import { body, param } from 'express-validator';

import * as cartController from '../controllers/cart.js';
import ensureAuthentication from '../middlewares/ensure-authentication.js';
import validateRequest from '../middlewares/validate-request.js';
import dbPool from '../services/postgres.service.js';
import { getProduct } from '../models/product.js';

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

            const { quantity_in_stock: productQuantity } = await getProduct(
                // we've already validated req.body.productId, so we can use type casting
                req.body.productId as number,
                ['quantity_in_stock']
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
    param('productId')
        .isNumeric()
        .withMessage('productId must be a number'),
    validateRequest,
    cartController.deleteProductFromCart
);

export default router;
