import { Pool, PoolClient } from 'pg';

import UserDataForAccessToken from '../interfaces/UserDataForAccessToken.js';
import dbPool from '../services/postgres.service.js';
import camelCaseObject from '../util/camelCaseObject.js';

// it returns an object with { isAdmin: boolean }
// or, if the user doesn't exist, it returns null
export const getUserDataForAccessToken = async (
    userId: number,
    dbClient?: PoolClient | Pool
): Promise<UserDataForAccessToken | null> => {
    const client = dbClient || dbPool;

    const { rows } = await client.query<{ email: string; is_admin: boolean }>(
        'SELECT email, is_admin FROM users WHERE id = $1',
        [userId]
    );
    const userData = camelCaseObject(rows[0]);

    if (userData) return { email: userData.email, isAdmin: userData.isAdmin };

    return null;
};
