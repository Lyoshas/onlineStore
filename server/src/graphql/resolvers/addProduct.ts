import DBProduct from '../../interfaces/DBProduct.js';
import validateUser from '../validators/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import DisplayProduct from '../../interfaces/DisplayProduct.js';
import isProductAvailable from '../helpers/isProductAvailable.js';
import isProductRunningOut from '../helpers/isProductRunningOut.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import { getImageUrlByObjectKey } from '../../models/amazon-s3.js';
import GraphqlAddProductsArgs from '../../interfaces/GraphqlAddProductArgs.js';
import checkImageNames from '../validators/checkImageNames.js';
import checkProductCategory from '../validators/checkProductCategory.js';
import checkImageMimeTypes from '../validators/checkImageMimeTypes.js';
import { performProductUpsertCleanup as performProductInsertCleanup } from '../helpers/performProductUpsertCleanup.js';
import checkProductPrice from '../validators/checkProductPrice.js';
import checkProductTitle from '../validators/checkProductTitle.js';
import checkQuantityInStock from '../validators/checkQuantityInStock.js';
import checkShortDescription from '../validators/checkShortDescription.js';

export default async (
    _: any,
    args: GraphqlAddProductsArgs,
    context: ApolloServerContext
): Promise<DisplayProduct> => {
    const {
        title,
        price,
        category,
        quantityInStock,
        shortDescription,
        initialImageName,
        additionalImageName,
    } = args;

    // if a user doesn't have enough privileges, throw an error immediately
    await validateUser(context.user);

    try {
        // if any of these checks fail, an error will be thrown, the product will not be added, and initialImageName and additionalImageName objects will be removed from the S3 bucket
        checkProductTitle(title);
        checkProductPrice(price);
        checkQuantityInStock(quantityInStock);
        checkShortDescription(shortDescription);
        await checkImageNames(initialImageName, additionalImageName);
        // both images must have the MIME type of 'image/png'
        await checkImageMimeTypes(initialImageName, additionalImageName);
        await checkProductCategory(category);

        const initialImageUrl = getImageUrlByObjectKey(initialImageName);
        const additionalImageUrl = getImageUrlByObjectKey(additionalImageName);

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
                title,
                price,
                initialImageUrl,
                additionalImageUrl,
                quantityInStock,
                shortDescription,
                category,
            ]
        );

        return {
            id: rows[0].id as DBProduct['id'],
            title: title,
            price: price,
            category: category,
            initialImageUrl: initialImageUrl,
            additionalImageUrl: additionalImageUrl,
            shortDescription: shortDescription,
            isAvailable: isProductAvailable(quantityInStock),
            isRunningOut: isProductRunningOut(quantityInStock),
        };
    } catch (error) {
        // we won't wait for the execution of this function as it's not necessary
        // instead it will run asynchronously
        performProductInsertCleanup(initialImageName, additionalImageName);

        throw error;
    }
};
