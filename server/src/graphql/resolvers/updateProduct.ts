import validateUser from '../helpers/validateUser';
import dbPool from '../../services/postgres.service';
import isProductRunningOut from '../helpers/isProductRunningOut';
import isProductAvailable from '../helpers/isProductAvailable';
import ApolloServerContext from '../../interfaces/ApolloServerContext';
import DisplayProduct from '../../interfaces/DisplayProduct';
import {
    getImageUrlByObjectKey,
} from '../../models/file-upload';
import GraphqlAddProductsArgs from '../../interfaces/GraphqlAddProductArgs';
import checkImageNames from '../helpers/checkImageNames';
import checkProductCategory from '../helpers/checkProductCategory';

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
