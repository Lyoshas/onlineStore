import express from 'express';
import { query } from 'express-validator';

import * as shippingController from '../controllers/shipping.js';
import { doesCityExist } from '../models/shipping.js';
import validateRequest from '../middlewares/validate-request.js';

const router = express.Router();

router.get(
    '/nova-poshta/warehouses',
    query('city')
        .notEmpty()
        .withMessage("the field 'city' must be specified")
        .custom((city) => {
            if (Number.isNaN(+city)) return true;
            throw new Error("the field 'city' must be a string");
        })
        .withMessage("the field 'city' must be a string"),
    // if the 'city' field is not a string, there's no point in proceeding further
    validateRequest,
    query('city').custom(async (city: string) => {
        if (await doesCityExist(city)) return Promise.resolve();
        return Promise.reject('the provided city is not supported');
    }),
    validateRequest,
    shippingController.getWarehousesByCity
);

export default router;
