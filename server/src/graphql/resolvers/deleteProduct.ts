import validateUser from '../helpers/validateUser';
import dbPool from '../../services/postgres.service';
import ApolloServerContext from '../../interfaces/ApolloServerContext';

export default async (
    _: any,
    args: any,
    context: ApolloServerContext
): Promise<{ id: number }> => {
    await validateUser(context.user);

    const { id } = args;

    if (typeof id !== 'number') {
        throw new Error('Argument "id" must be an integer');
    }

    const { rowCount } = await dbPool.query(
        'DELETE FROM products WHERE id = $1',
        [id]
    );

    if (rowCount === 0) {
        throw new Error('A product with the specified id does not exist');
    }

    return { id };
};
