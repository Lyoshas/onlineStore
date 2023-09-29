import express from 'express';
import { body, param } from 'express-validator';
import asyncHandler from 'express-async-handler';

import * as cartController from '../controllers/cart.js';
import ensureAuthentication from '../middlewares/ensure-authentication.js';
import validateRequest from '../middlewares/validate-request.js';
import dbPool from '../services/postgres.service.js';
import { getProduct } from '../models/product.js';
import InsufficientProductStockError from '../errors/InsufficientProductStockError.js';

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
    [
        body('productId')
            .isNumeric()
            .withMessage('productId must be a number')
            .bail()
            .custom(async (productId: number) => {
                const doesProductExist: boolean = await dbPool
                    .query(
                        'SELECT EXISTS(SELECT 1 FROM products WHERE id = $1)',
                        [productId]
                    )
                    .then(({ rows }) => rows[0].exists);
                if (!doesProductExist) return Promise.reject();
                return Promise.resolve();
            })
            .withMessage('productId must point to a valid product'),
        // if the product id is invalid, return the error and don't check any other field
        validateRequest,
        body('quantity')
            .isInt({ gt: 0 })
            .withMessage('quantity must be an integer and greater than zero'),
        validateRequest,
        // we need to check whether we have this many products in stock
        // we're doing it separately from the initial validation, because this check may return the 409 status code
        asyncHandler(async (req, res, next) => {
            const { quantity: requestedQuantity, productId } = req.body;

            const { quantity_in_stock: productQuantity } = await getProduct(
                productId,
                ['quantity_in_stock']
            );

            if (productQuantity < requestedQuantity) {
                throw new InsufficientProductStockError();
            }

            next();
        }),
    ],
    cartController.addProductToCart
);

router.delete(
    '/cart/:productId',
    ensureAuthentication,
    param('productId').isNumeric().withMessage('productId must be a number'),
    validateRequest,
    cartController.deleteProductFromCart
);

export default router;
