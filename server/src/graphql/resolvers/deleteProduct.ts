import validateUser from '../validators/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import { performProductUpsertCleanup as performProductDeleteCleanup } from '../helpers/performProductUpsertCleanup.js';
import { getObjectKeyByImageUrl } from '../../models/amazon-s3.js';
import ProductNotFoundError from '../errors/ProductNotFoundError.js';
import { getUsersWithProductInCart } from '../../models/cartPostgres.js';
import { cleanCart } from '../../models/cartRedis.js';

interface DeleteProductArguments {
    id: number;
}

export default async (
    _: any,
    args: DeleteProductArguments,
    context: ApolloServerContext
): Promise<{ id: number }> => {
    await validateUser(context.user);

    const { id: productId } = args;

    // returns users who have the product that is about to be deleted
    // we'll need to invalidate their cart cache in Redis to avoid inconsistencies
    const affectedUserIds = await getUsersWithProductInCart(productId);

    const { rowCount, rows } = await dbPool.query<{
        initial_image_url: string;
        additional_image_url: string;
    }>(
        `
            DELETE FROM products
            WHERE id = $1
            RETURNING initial_image_url, additional_image_url
        `,
        [productId]
    );

    if (rowCount === 0) {
        throw new ProductNotFoundError();
    }

    // since we have a feature that allows to cache carts in Redis,
    // we need to invalidate the carts of those users who have this deleted product in their cart
    // this will be done in the background, no need for the user to wait until it's done
    cleanCart(affectedUserIds);

    // now we need to delete S3 objects what are associated with the specified productId
    // but we will delete them only if there are no other products these images are tied to
    // this function will run asynchronously
    performProductDeleteCleanup(
        getObjectKeyByImageUrl(rows[0].initial_image_url),
        getObjectKeyByImageUrl(rows[0].additional_image_url)
    );

    // we return immediately and the cache invalidation / cleanup processes will be executed in the background
    return { id: productId };
};
