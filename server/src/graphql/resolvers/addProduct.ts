import DBProduct from '../../interfaces/DBProduct.js';
import validateUser from '../validators/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import isProductAvailable from '../helpers/isProductAvailable.js';
import isProductRunningOut from '../helpers/isProductRunningOut.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import { getImageUrlByObjectKey } from '../../models/amazon-s3.js';
import GraphqlAddProductArgs from '../../interfaces/GraphqlAddProductArgs.js';
import checkImageNames from '../validators/checkImageNames.js';
import checkProductCategory from '../validators/checkProductCategory.js';
import checkImageMimeTypes from '../validators/checkImageMimeTypes.js';
import { performProductUpsertCleanup as performProductInsertCleanup } from '../helpers/performProductUpsertCleanup.js';
import checkProductPrice from '../validators/checkProductPrice.js';
import checkProductTitle from '../validators/checkProductTitle.js';
import checkQuantityInStock from '../validators/checkQuantityInStock.js';
import checkShortDescription from '../validators/checkShortDescription.js';
import checkMaxOrderQuantity from '../validators/checkMaxOrderQuantity.js';
import ProductUpsertReturnValue from '../../interfaces/ProductUpsertReturnValue.js';
import knex from '../../services/knex.service.js';
import AnyObject from '../../interfaces/AnyObject.js';
import snakeCaseObject from '../../util/snakeCaseObject.js';

export default async (
    _: any,
    args: GraphqlAddProductArgs,
    context: ApolloServerContext
): Promise<ProductUpsertReturnValue> => {
    const {
        title,
        price,
        category,
        quantityInStock,
        shortDescription,
        initialImageName,
        additionalImageName,
        maxOrderQuantity,
    } = args;

    // if a user doesn't have enough privileges, throw an error immediately
    await validateUser(context.user);

    try {
        // if any of these checks fail, an error will be thrown, the product will not be added, and initialImageName and additionalImageName objects will be removed from the S3 bucket
        checkProductTitle(title);
        checkProductPrice(price);
        checkQuantityInStock(quantityInStock);
        checkShortDescription(shortDescription);
        typeof maxOrderQuantity === 'number' &&
            checkMaxOrderQuantity(maxOrderQuantity);
        await checkImageNames(initialImageName, additionalImageName);
        // both images must have the MIME type of 'image/png'
        await checkImageMimeTypes(initialImageName, additionalImageName);
        await checkProductCategory(category);

        const initialImageUrl = getImageUrlByObjectKey(initialImageName);
        const additionalImageUrl = getImageUrlByObjectKey(additionalImageName);

        let insertParameters: AnyObject = snakeCaseObject({
            title,
            price,
            categoryId: knex
                .select('id')
                .from('product_categories')
                .where({ category }),
            quantityInStock,
            shortDescription,
            initialImageUrl,
            additionalImageUrl,
            ...(maxOrderQuantity == null ? {} : { maxOrderQuantity }),
        });

        // since we have parameters that may or may not exist (in our case it's "max_order_quantity"), it wouldn't be really practical to use the native pg driver
        // so we're building a dynamic query with Knex
        const sqlQuery: string = knex
            .insert(insertParameters)
            .into('products')
            .returning(['id', 'max_order_quantity'])
            .toString();

        const { rows } = await dbPool.query<{
            id: number;
            max_order_quantity: number;
        }>(sqlQuery);

        return {
            id: rows[0].id as DBProduct['id'],
            title,
            price,
            category,
            initialImageUrl,
            additionalImageUrl,
            shortDescription,
            maxOrderQuantity: rows[0].max_order_quantity,
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
