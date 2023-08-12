import { PoolClient } from 'pg';

import { normalizeHostname } from './hostname.js';
import redis from '../services/redis.service.js';
import dbPool from '../services/postgres.service.js';

export const generateResetPasswordLink = (
    hostname: string,
    resetToken: string
): string => {
    hostname = normalizeHostname(hostname);
    return `http://${hostname}/auth/reset-password/${resetToken}`;
};

export const getUserIdByResetToken = async (
    resetToken: string
): Promise<number | null> => {
    const dbEntry = await redis.hgetall(resetToken);

    if (dbEntry.type !== 'resetToken' || Number.isNaN(+dbEntry.userId)) {
        // the token is invalid, so the userId is null
        return null;
    }

    return +dbEntry.userId;
};

export const changePassword = async (
    userId: number,
    hashedPassword: string,
    dbClient?: PoolClient
) => {
    const client = dbClient || dbPool;
    return client.query('UPDATE users SET password = $1 WHERE id = $2', [
        hashedPassword,
        userId,
    ]);
};

export const revokeResetToken = async (resetToken: string) => {
    return redis.del(resetToken);
};
