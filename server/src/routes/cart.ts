import express from 'express';
import { body, param, query } from 'express-validator';
import asyncHandler from 'express-async-handler';

import * as cartController from '../controllers/cart.js';
import ensureAuthentication from '../middlewares/ensure-authentication.js';
import validateRequest from '../middlewares/validate-request.js';
import dbPool from '../services/postgres.service.js';
import { getProduct } from '../models/product.js';
import InsufficientProductStockError from '../errors/InsufficientProductStockError.js';
import { ExceededMaxOrderQuantityError } from '../errors/ExceededMaxOrderQuantity.js';

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
        // and whether the user is trying to order more products than it's allowed
        // we're doing it separately from the initial validation, because these checks may return the 409 status code
        asyncHandler(async (req, res, next) => {
            const { quantity: requestedQuantity, productId } = req.body;

            const {
                quantity_in_stock: productQuantity,
                max_order_quantity: maxOrderQuantity,
            } = await getProduct(productId, [
                'quantity_in_stock',
                'max_order_quantity',
            ]);

            if (productQuantity < requestedQuantity) {
                throw new InsufficientProductStockError();
            } else if (requestedQuantity > maxOrderQuantity) {
                throw new ExceededMaxOrderQuantityError(maxOrderQuantity);
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

router.get(
    '/cart/is-safe-to-add-product',
    [
        query('productId')
            .isNumeric()
            .withMessage('productId must be a number'),
        query('quantityToAdd')
            .isInt({ gt: 0 })
            .withMessage(
                'quantityToAdd must be an integer and greater than zero'
            ),
        validateRequest,
    ],
    cartController.isSafeToAddProductToCart
);

export default router;
