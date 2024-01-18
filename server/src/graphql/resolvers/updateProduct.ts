import validateUser from '../validators/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import isProductRunningOut from '../helpers/isProductRunningOut.js';
import isProductAvailable from '../helpers/isProductAvailable.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import { getImageUrlByObjectKey } from '../../models/amazon-s3.js';
import checkProductCategory from '../validators/checkProductCategory.js';
import checkImageMimeTypes from '../validators/checkImageMimeTypes.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import { performProductUpsertCleanup as performProductUpdateCleanup } from '../helpers/performProductUpsertCleanup.js';
import checkProductTitle from '../validators/checkProductTitle.js';
import checkProductPrice from '../validators/checkProductPrice.js';
import checkQuantityInStock from '../validators/checkQuantityInStock.js';
import checkShortDescription from '../validators/checkShortDescription.js';
import checkImageNames from '../validators/checkImageNames.js';
import GraphqlUpdateProductArgs from '../../interfaces/GraphqlUpdateProductArgs.js';
import checkMaxOrderQuantity from '../validators/checkMaxOrderQuantity.js';
import ProductUpsertReturnValue from '../../interfaces/ProductUpsertReturnValue.js';
import { getUsersWithProductInCart } from '../../models/cart-postgres.js';
import { cleanCart } from '../../models/cart-redis.js';

export default async (
    _: any,
    args: GraphqlUpdateProductArgs,
    context: ApolloServerContext
): Promise<ProductUpsertReturnValue> => {
    // if any of these checks fail, an error will be thrown and the product will not be updated
    await validateUser(context.user);

    const {
        id: productId,
        title,
        price,
        category,
        shortDescription,
        quantityInStock,
        initialImageName,
        additionalImageName,
        maxOrderQuantity,
    } = args;

    try {
        checkProductTitle(title);
        checkProductPrice(price);
        checkQuantityInStock(quantityInStock);
        checkShortDescription(shortDescription);
        checkMaxOrderQuantity(maxOrderQuantity);
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
                category_id = (SELECT id FROM product_categories WHERE category = $3),
                initial_image_url = $4,
                additional_image_url = $5,
                short_description = $6,
                quantity_in_stock = $7,
                max_order_quantity = $8
            WHERE id = $9`,
            [
                title,
                price,
                category,
                initialImageUrl,
                additionalImageUrl,
                shortDescription,
                quantityInStock,
                maxOrderQuantity,
                productId,
            ]
        );

        if (rowCount === 0) {
            throw new ProductNotFoundError();
        }

        // this IIFE will run asynchronously, without the user having to wait until it's finished
        (async function () {
            // returns users who have the product that was updated in their cart
            // we'll need to invalidate their cart cache in Redis to avoid inconsistencies
            const affectedUserIds = await getUsersWithProductInCart(productId);
            // since we have a feature that allows to cache carts in Redis,
            // we need to invalidate the carts of those users who have this updated product in their cart
            // this will be done in the background, no need for the user to wait until it's done
            await cleanCart(affectedUserIds);
        })();

        return {
            id: productId,
            title,
            price,
            category,
            initialImageUrl,
            additionalImageUrl,
            shortDescription,
            maxOrderQuantity,
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
