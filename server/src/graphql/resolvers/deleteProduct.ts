import validateUser from '../validators/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';
import { performProductUpsertCleanup as performProductDeleteCleanup } from '../helpers/performProductUpsertCleanup.js';
import { getObjectKeyByImageUrl } from '../../models/amazon-s3.js';

interface DeleteProductArguments {
    id: number;
}

export default async (
    _: any,
    args: DeleteProductArguments,
    context: ApolloServerContext
): Promise<{ id: number }> => {
    await validateUser(context.user);

    const { id } = args;

    const { rowCount, rows } = await dbPool.query<{
        initial_image_url: string;
        additional_image_url: string;
    }>(
        `
            DELETE FROM products
            WHERE id = $1
            RETURNING initial_image_url, additional_image_url
        `,
        [id]
    );

    if (rowCount === 0) {
        throw new Error('A product with the specified id does not exist');
    }

    // now we need to delete S3 objects what are associated with the specified productId
    // but we will delete them only if there are no other products these images are tied to
    // this function will run asynchronously
    performProductDeleteCleanup(
        getObjectKeyByImageUrl(rows[0].initial_image_url),
        getObjectKeyByImageUrl(rows[0].additional_image_url)
    );

    return { id };
};
