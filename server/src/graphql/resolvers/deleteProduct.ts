import validateUser from '../helpers/validateUser.js';
import dbPool from '../../services/postgres.service.js';
import ApolloServerContext from '../../interfaces/ApolloServerContext.js';

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

    const { rowCount } = await dbPool.query(
        'DELETE FROM products WHERE id = $1',
        [id]
    );

    if (rowCount === 0) {
        throw new Error('A product with the specified id does not exist');
    }

    return { id };
};
