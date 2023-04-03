import DBProduct from '../../interfaces/DBProduct';
import validateUser from '../helpers/validateUser';
import dbPool from '../../services/postgres.service';
import DisplayProduct from '../../interfaces/DisplayProduct';
import isProductAvailable from '../helpers/isProductAvailable';
import isProductRunningOut from '../helpers/isProductRunningOut';
import ApolloServerContext from '../../interfaces/ApolloServerContext';

export default async (
    _: any,
    args: Omit<DBProduct, 'id'>,
    context: ApolloServerContext
): Promise<DisplayProduct> => {
    await validateUser(context.user);

    const { rows } = await dbPool.query(
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
    );

    return {
        id: rows[0].id as number,
        title: args.title,
        price: args.price,
        previewURL: args.previewURL,
        isAvailable: isProductAvailable(args.quantityInStock),
        isRunningOut: isProductRunningOut(args.quantityInStock)
    };
};
