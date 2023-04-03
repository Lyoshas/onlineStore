import loadEnvVariables from './loadEnv';
import dbPool from '../../services/postgres.service';

loadEnvVariables();

export default (productId: number): Promise<boolean> => {
    return dbPool.query(
        'SELECT 1 FROM products WHERE id = $1',
        [productId]
    ).then(({ rows }) => rows.length !== 0);
}
