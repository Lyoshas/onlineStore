import DBProduct from '../../interfaces/DBProduct';
import validateUser from '../helpers/validateUser';
import dbPool from '../../services/postgres.service';
import DisplayProduct from '../../interfaces/DisplayProduct';
import isProductAvailable from '../helpers/isProductAvailable';
import isProductRunningOut from '../helpers/isProductRunningOut';
import ApolloServerContext from '../../interfaces/ApolloServerContext';
import { getImageUrlByObjectKey } from '../../models/file-upload';
import GraphqlAddProductsArgs from '../../interfaces/GraphqlAddProductArgs';

export default async (
    _: any,
    args: GraphqlAddProductsArgs,
    context: ApolloServerContext
): Promise<DisplayProduct> => {
    await validateUser(context.user);

    const initialImageUrl = getImageUrlByObjectKey(args.initialImageName);
    const additionalImageUrl = getImageUrlByObjectKey(args.additionalImageName);

    const { rows } = await dbPool.query(
        `INSERT INTO products (
            title,
            price,
            initial_image_url,
            additional_image_url,
            quantity_in_stock,
            short_description,
            category
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
            args.title,
            args.price,
            initialImageUrl,
            additionalImageUrl,
            args.quantityInStock,
            args.shortDescription,
            args.category,
        ]
    );

    return {
        id: rows[0].id as DBProduct['id'],
        title: args.title,
        price: args.price,
        category: args.category,
        initialImageUrl: initialImageUrl,
        additionalImageUrl: additionalImageUrl,
        shortDescription: args.shortDescription,
        isAvailable: isProductAvailable(args.quantityInStock),
        isRunningOut: isProductRunningOut(args.quantityInStock),
    };
};
