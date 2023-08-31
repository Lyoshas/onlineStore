import validateUser from '../validators/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import isProductRunningOut from '../helpers/isProductRunningOut.js';
import isProductAvailable from '../helpers/isProductAvailable.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import { getImageUrlByObjectKey } from '../../models/amazon-s3.js';
import GraphqlAddProductsArgs from '../../interfaces/GraphqlAddProductArgs.js';
import checkProductCategory from '../validators/checkProductCategory.js';
import checkImageMimeTypes from '../validators/checkImageMimeTypes.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import { performProductUpsertCleanup as performProductUpdateCleanup } from '../helpers/performProductUpsertCleanup.js';
import checkProductTitle from '../validators/checkProductTitle.js';
import checkProductPrice from '../validators/checkProductPrice.js';
import checkQuantityInStock from '../validators/checkQuantityInStock.js';
import checkShortDescription from '../validators/checkShortDescription.js';
import checkImageNames from '../validators/checkImageNames.js';

export default async (
    _: any,
    args: GraphqlAddProductsArgs & { id: number },
    context: ApolloServerContext
): Promise<DisplayProduct> => {
    // if any of these checks fail, an error will be thrown and the product will not be updated
    await validateUser(context.user);

    const {
        id,
        title,
        price,
        category,
        shortDescription,
        quantityInStock,
        initialImageName,
        additionalImageName,
    } = args;

    try {
        checkProductTitle(title);
        checkProductPrice(price);
        checkQuantityInStock(quantityInStock);
        checkShortDescription(shortDescription);
        await checkImageNames(initialImageName, additionalImageName);
        await checkImageMimeTypes(initialImageName, additionalImageName);
        await checkProductCategory(category);

        const initialImageUrl = getImageUrlByObjectKey(initialImageName);
        const additionalImageUrl = getImageUrlByObjectKey(additionalImageName);

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
            throw new ProductNotFoundError();
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
    } catch (error) {
        // we won't wait for the execution of this function as it's not necessary
        // instead it will run asynchronously
        performProductUpdateCleanup(initialImageName, additionalImageName);

        throw error;
    }
};
