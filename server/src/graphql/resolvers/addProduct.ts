import DBProduct from '../../interfaces/DBProduct';
import validateUser from '../helpers/validateUser';
import dbPool from '../../services/postgres.service';
import DisplayProduct from '../../interfaces/DisplayProduct';
import isProductAvailable from '../helpers/isProductAvailable';
import isProductRunningOut from '../helpers/isProductRunningOut';
import ApolloServerContext from '../../interfaces/ApolloServerContext';

type AddProductArguments = Omit<
    DisplayProduct,
    'id' | 'isAvailable' | 'isRunningOut'
> & { quantityInStock: number };

export default async (
    _: any,
    args: AddProductArguments,
    context: ApolloServerContext
): Promise<DisplayProduct> => {
    await validateUser(context.user);

    const { rows } = await dbPool.query(
        `INSERT INTO products (
            title,
            price,
            initial_image_url,
            additional_image_url,
            quantity_in_stock,
            short_description
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
            args.title,
            args.price,
            args.initialImageUrl,
            args.additionalImageUrl,
            args.quantityInStock,
            args.shortDescription,
        ]
    );

    return {
        id: rows[0].id as DBProduct['id'],
        title: args.title,
        price: args.price,
        initialImageUrl: args.initialImageUrl,
        additionalImageUrl: args.additionalImageUrl,
        shortDescription: args.shortDescription,
        isAvailable: isProductAvailable(args.quantityInStock),
        isRunningOut: isProductRunningOut(args.quantityInStock),
    };
};
