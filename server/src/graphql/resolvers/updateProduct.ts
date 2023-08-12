import validateUser from '../helpers/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import isProductRunningOut from '../helpers/isProductRunningOut.js';
import isProductAvailable from '../helpers/isProductAvailable.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import {
    getImageUrlByObjectKey,
} from '../../models/amazon-s3.js';
import GraphqlAddProductsArgs from '../../interfaces/GraphqlAddProductArgs.js';
import checkImageNames from '../helpers/checkImageNames.js';
import checkProductCategory from '../helpers/checkProductCategory.js';

export default async (
    _: any,
    args: GraphqlAddProductsArgs & { id: number },
    context: ApolloServerContext
): Promise<DisplayProduct> => {
    // if any of these checks fail, an error will be thrown and the product will not be updated
    await validateUser(context.user);
    await checkImageNames(args.initialImageName, args.additionalImageName);
    await checkProductCategory(args.category);

    const initialImageUrl = getImageUrlByObjectKey(args.initialImageName);
    const additionalImageUrl = getImageUrlByObjectKey(args.additionalImageName);

    const { id, title, price, category, shortDescription, quantityInStock } =
        args;

    const { rowCount } = await dbPool.query(
        `UPDATE products
        SET
            title = $1,
            price = $2,
            category = $3,
            initial_image_url = $4,
            additional_image_url = $5,
            short_description = $6,
            quantity_in_stock = $7
        WHERE id = $8`,
        [
            title,
            price,
            category,
            initialImageUrl,
            additionalImageUrl,
            shortDescription,
            quantityInStock,
            id,
        ]
    );

    if (rowCount === 0) {
        throw new Error(`A product with the specified id does not exist`);
    }

    return {
        id,
        title,
        price,
        category,
        initialImageUrl,
        additionalImageUrl,
        shortDescription,
        isAvailable: isProductAvailable(quantityInStock),
        isRunningOut: isProductRunningOut(quantityInStock),
    };
};
