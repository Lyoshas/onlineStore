import { Request } from 'express';

import validateUser from '../helpers/validateUser';
import dbPool from '../../util/database';

export default async (
    parent: any,
    args: any,
    req: Request
): Promise<{ id: number }> => {
    validateUser(req.user);

    const { id } = args;

    if (typeof id !== 'number') {
        throw new Error('Argument "id" must be an integer');
    }

    const { rowCount } = await dbPool.query(
        'DELETE FROM products WHERE id = $1',
        [id]
    );

    if (rowCount === 0) {
        throw new Error('A product with the specified id does not exist');
    }

    return { id };
};
