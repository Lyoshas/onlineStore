import { Request } from 'express';

import DBProduct from '../../interfaces/DBProduct';
import validateUser from '../helpers/validateUser';
import dbPool from '../../util/database';
import DisplayProduct from '../../interfaces/DisplayProduct';

export default (
    parent: any,
    args: DBProduct,
    req: Request
): Promise<DisplayProduct> => {
    validateUser(req.user);

    return dbPool.query(
        `INSERT INTO products (
            title,
            price,
            preview_url,
            quantity_in_stock
        ) VALUES ($1, $2, $3, $4) RETURNING id`,
        [
            args.title,
            args.price,
            args.previewURL,
            args.quantityInStock
        ]
    ).then(({ rows }) => ({
        id: rows[0].id as number,
        title: args.title,
        price: args.price,
        previewURL: args.previewURL,
        isAvailable: args.quantityInStock > 1,
        isRunningOut: args.quantityInStock <= 5
    }));
};
