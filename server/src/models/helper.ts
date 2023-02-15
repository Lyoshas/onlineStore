import { PoolClient } from 'pg';

export const beginTransaction = (dbClient: PoolClient) => {
    return dbClient.query('BEGIN TRANSACTION');
};

export const commitTransaction = (dbClient: PoolClient) => {
    return dbClient.query('COMMIT');
};

export const rollbackTransaction = (dbClient: PoolClient) => {
    return dbClient.query('ROLLBACK');
};
