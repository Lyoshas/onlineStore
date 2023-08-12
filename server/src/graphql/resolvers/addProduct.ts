import DBProduct from '../../interfaces/DBProduct.js';
import validateUser from '../helpers/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import isProductAvailable from '../helpers/isProductAvailable.js';
import isProductRunningOut from '../helpers/isProductRunningOut.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import { getImageUrlByObjectKey } from '../../models/file-upload.js';
import GraphqlAddProductsArgs from '../../interfaces/GraphqlAddProductArgs.js';
import checkImageNames from '../helpers/checkImageNames.js';
import checkProductCategory from '../helpers/checkProductCategory.js';

export default async (
    _: any,
    args: GraphqlAddProductsArgs,
    context: ApolloServerContext
): Promise<DisplayProduct> => {
    // if any of these checks fail, an error will be thrown and the product will not be added
    await validateUser(context.user);
    await checkImageNames(args.initialImageName, args.additionalImageName);
    await checkProductCategory(args.category);

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
