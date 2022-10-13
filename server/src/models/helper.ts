import dbPool from '../util/database';

export const beginTransaction = () => {
    return dbPool.query('BEGIN TRANSACTION');
};

export const commitTransaction = () => {
    return dbPool.query('COMMIT');
};

export const rollbackTransaction = () => {
    return dbPool.query('ROLLBACK');
};
